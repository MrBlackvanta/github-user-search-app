import { toProfile, type GitHubUser } from "@/lib/github";
import { makeUser } from "@/test/github-user";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import UserSearch from "./user-search";

const mona = makeUser({
  login: "mona",
  name: "Mona Lisa",
  html_url: "https://github.com/mona",
});

function serveUsers(...users: GitHubUser[]) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
    const login = String(input).split("/").pop();
    const user = users.find((candidate) => candidate.login === login);
    return user ? Response.json(user) : new Response(null, { status: 404 });
  });
}

function renderSearch() {
  const user = userEvent.setup();
  render(<UserSearch initialProfile={toProfile(makeUser())} />);
  return user;
}

function field() {
  return screen.getByRole("textbox", { name: "GitHub username" });
}

function searchButton() {
  return screen.getByRole("button", { name: "Search" });
}

describe("UserSearch", () => {
  it("offers a search landmark over the Octocat's card, with a silent status region", () => {
    renderSearch();

    const search = screen.getByRole("search");
    expect(within(search).getByRole("textbox")).toBe(field());
    expect(within(search).getByRole("button")).toBe(searchButton());
    expect(
      screen.getByRole("article", { name: "The Octocat" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("shows the searched user, announces them and keeps the query", async () => {
    const fetchMock = serveUsers(mona);
    const user = renderSearch();

    await user.type(field(), "mona{Enter}");

    expect(
      await screen.findByRole("article", { name: "Mona Lisa" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("Found Mona Lisa");
    expect(field()).toHaveValue("mona");
    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/users/mona",
      expect.anything(),
    );
  });

  it("searches in place instead of submitting the page", async () => {
    serveUsers(mona);
    const user = renderSearch();
    await user.type(field(), "mona");

    const submitted = fireEvent.submit(screen.getByRole("search"));

    expect(submitted, "the browser would navigate").toBe(false);
    expect(
      await screen.findByRole("article", { name: "Mona Lisa" }),
    ).toBeInTheDocument();
  });

  it("answers an unknown user with No results tied to the field", async () => {
    serveUsers();
    const user = renderSearch();

    await user.type(field(), "nobody{Enter}");

    expect(await screen.findByRole("alert")).toHaveTextContent("No results");
    expect(field()).toHaveAttribute("aria-invalid", "true");
    expect(field()).toHaveAccessibleDescription("No results");
    expect(screen.getByRole("article", { name: "The Octocat" })).toBeVisible();
    expect(screen.getByRole("status")).toBeEmptyDOMElement();
  });

  it("clears the error on the next keystroke", async () => {
    serveUsers();
    const user = renderSearch();
    await user.type(field(), "nobody{Enter}");
    await screen.findByRole("alert");

    await user.type(field(), "x");

    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(field()).not.toHaveAttribute("aria-invalid");
    expect(field()).not.toHaveAccessibleDescription();
  });

  it("announces the same failure again with a fresh alert", async () => {
    const fetchMock = serveUsers();
    const user = renderSearch();
    await user.type(field(), "nobody{Enter}");
    const firstAlert = await screen.findByRole("alert");

    await user.click(searchButton());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByRole("alert")).not.toBe(firstAlert));
    expect(screen.getByRole("alert")).toHaveTextContent("No results");
  });

  it("announces the same user again with a fresh status", async () => {
    serveUsers(mona);
    const user = renderSearch();
    await user.type(field(), "mona{Enter}");
    const firstStatus = await within(screen.getByRole("status")).findByText(
      "Found Mona Lisa",
    );

    await user.click(searchButton());

    await waitFor(() =>
      expect(
        within(screen.getByRole("status")).getByText("Found Mona Lisa"),
      ).not.toBe(firstStatus),
    );
  });

  it.each([
    ["a rate limit", () => new Response(null, { status: 403 })],
    [
      "a network failure",
      () => {
        throw new TypeError("Failed to fetch");
      },
    ],
  ])("asks the user to try later after %s", async (_case, reply) => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async () => reply());
    const user = renderSearch();

    await user.type(field(), "mona{Enter}");

    expect(await screen.findByRole("alert")).toHaveTextContent("Try later");
    expect(screen.getByRole("article", { name: "The Octocat" })).toBeVisible();
  });

  it.each(["", "   ", "@"])(
    "does nothing for the empty query %j",
    async (query) => {
      const fetchMock = serveUsers(mona);
      const user = renderSearch();

      if (query) await user.type(field(), query);
      await user.click(searchButton());

      expect(fetchMock).not.toHaveBeenCalled();
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.getByRole("article")).not.toHaveAttribute(
        "aria-busy",
        "true",
      );
    },
  );

  it("answers an impossible username with No results and no request", async () => {
    const fetchMock = serveUsers(mona);
    const user = renderSearch();

    await user.type(field(), "octo cat{Enter}");

    expect(await screen.findByRole("alert")).toHaveTextContent("No results");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("keeps the current card up and marks it busy while a search runs", async () => {
    const reply = Promise.withResolvers<Response>();
    vi.spyOn(globalThis, "fetch").mockReturnValue(reply.promise);
    const user = renderSearch();

    await user.type(field(), "mona{Enter}");

    const card = screen.getByRole("article", { name: "The Octocat" });
    await waitFor(() => expect(card).toHaveAttribute("aria-busy", "true"));

    reply.resolve(Response.json(mona));

    const next = await screen.findByRole("article", { name: "Mona Lisa" });
    await waitFor(() => expect(next).toHaveAttribute("aria-busy", "false"));
  });

  it("lets a later search cancel a slower earlier one", async () => {
    const reply = Promise.withResolvers<Response>();
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockImplementationOnce(
        (_input, init) =>
          new Promise((_resolve, reject) =>
            init?.signal?.addEventListener("abort", () =>
              reject(init.signal?.reason),
            ),
          ),
      )
      .mockReturnValueOnce(reply.promise);
    const user = renderSearch();

    await user.type(field(), "slowpoke{Enter}");
    await user.clear(field());
    await user.type(field(), "mona{Enter}");

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[0][1]?.signal?.aborted).toBe(true);
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();

    reply.resolve(Response.json(mona));

    expect(
      await screen.findByRole("article", { name: "Mona Lisa" }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
