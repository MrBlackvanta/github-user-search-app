import { makeUser } from "@/test/github-user";
import { describe, expect, it, vi } from "vitest";
import { fetchProfile, toProfile, toUsername } from "./github";

function replyWith(reply: () => Response) {
  return vi.spyOn(globalThis, "fetch").mockImplementation(async () => reply());
}

function hangUntilAborted() {
  return vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(
      (_input, init) =>
        new Promise((_resolve, reject) =>
          init?.signal?.addEventListener("abort", () =>
            reject(init.signal?.reason),
          ),
        ),
    );
}

function githubError(status: number) {
  return Response.json(
    {
      message: "API rate limit exceeded",
      documentation_url: "https://docs.github.com",
    },
    { status },
  );
}

function freshSignal() {
  return new AbortController().signal;
}

describe("toProfile", () => {
  it("carries the handle, URLs, join date and counts through as given", () => {
    expect(toProfile(makeUser())).toMatchObject({
      login: "octocat",
      avatarUrl: "https://avatars.githubusercontent.com/u/583231?v=4",
      profileUrl: "https://github.com/octocat",
      joinedAt: "2011-01-25T18:44:36Z",
      repos: 8,
      followers: 24580,
      following: 9,
    });
  });

  it.each([
    ["The Octocat", "The Octocat"],
    ["  Mona Lisa  ", "Mona Lisa"],
    ["", "octocat"],
    ["   ", "octocat"],
    [null, "octocat"],
  ])("names %j as %j", (name, expected) => {
    expect(toProfile(makeUser({ name })).name).toBe(expected);
  });

  it.each([
    ["Building things.\n", "Building things."],
    [" \n ", null],
    ["", null],
    [null, null],
  ])("reads the bio %j as %j", (bio, expected) => {
    expect(toProfile(makeUser({ bio })).bio).toBe(expected);
  });

  it.each([
    ["San Francisco", { text: "San Francisco" }],
    ["  ", null],
    [null, null],
  ])("shows the location %j unlinked", (location, expected) => {
    expect(toProfile(makeUser({ location })).location).toEqual(expected);
  });

  it.each([
    [
      "https://github.blog",
      { text: "https://github.blog", href: "https://github.blog" },
    ],
    [
      "http://example.com",
      { text: "http://example.com", href: "http://example.com" },
    ],
    [
      "HTTPS://Example.com",
      { text: "HTTPS://Example.com", href: "HTTPS://Example.com" },
    ],
    ["github.blog", { text: "github.blog", href: "https://github.blog" }],
    [" github.blog ", { text: "github.blog", href: "https://github.blog" }],
    ["", null],
    [null, null],
  ])("links the website %j", (blog, expected) => {
    expect(toProfile(makeUser({ blog })).website).toEqual(expected);
  });

  it.each([
    ["octocat", { text: "@octocat", href: "https://x.com/octocat" }],
    ["", null],
    [null, null],
    [undefined, null],
  ])("links the Twitter handle %j", (twitter_username, expected) => {
    expect(toProfile(makeUser({ twitter_username })).twitter).toEqual(expected);
  });

  it.each([
    ["@github", { text: "@github", href: "https://github.com/github" }],
    ["@my-org", { text: "@my-org", href: "https://github.com/my-org" }],
    ["GitHub, Inc.", { text: "GitHub, Inc." }],
    ["github", { text: "github" }],
    ["@github @microsoft", { text: "@github @microsoft" }],
    ["", null],
    [null, null],
  ])(
    "links the company %j only when it is one org handle",
    (company, expected) => {
      expect(toProfile(makeUser({ company })).company).toEqual(expected);
    },
  );
});

describe("toUsername", () => {
  it.each([
    ["octocat", "octocat"],
    ["  octocat  ", "octocat"],
    ["@octocat", "octocat"],
    [" @octocat ", "octocat"],
    ["@@octocat", "@octocat"],
    ["@", ""],
    ["   ", ""],
  ])("reads the query %j as %j", (query, expected) => {
    expect(toUsername(query)).toBe(expected);
  });
});

describe("fetchProfile", () => {
  it("asks the GitHub users API and maps the user it returns", async () => {
    const fetchMock = replyWith(() => Response.json(makeUser()));

    const result = await fetchProfile("octocat", freshSignal());

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.github.com/users/octocat",
      expect.objectContaining({
        headers: { Accept: "application/vnd.github+json" },
      }),
    );
    expect(result).toEqual({ status: "found", profile: toProfile(makeUser()) });
  });

  it.each([
    ["a 404", () => new Response(null, { status: 404 }), "not-found"],
    ["a rate-limit 403", () => githubError(403), "unavailable"],
    ["a secondary rate-limit 429", () => githubError(429), "unavailable"],
    ["a 500", () => githubError(500), "unavailable"],
    ["a body that is not JSON", () => new Response("<html>"), "unavailable"],
    [
      "a network failure",
      () => {
        throw new TypeError("Failed to fetch");
      },
      "unavailable",
    ],
  ])("answers %s as %j", async (_case, reply, status) => {
    replyWith(reply);

    expect(await fetchProfile("octocat", freshSignal())).toEqual({ status });
  });

  it.each([
    "octo cat",
    "octo_cat",
    "octo.cat",
    "../orgs/github",
    "octocat?tab=repos",
    "ö",
    "",
    "a".repeat(40),
  ])("answers the impossible username %j without a request", async (name) => {
    const fetchMock = replyWith(() => Response.json(makeUser()));

    expect(await fetchProfile(name, freshSignal())).toEqual({
      status: "not-found",
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["a", "my-org", "A1-b2", "-legacy-", "a".repeat(39)])(
    "requests the possible username %j",
    async (name) => {
      const fetchMock = replyWith(() => Response.json(makeUser()));

      await fetchProfile(name, freshSignal());

      expect(fetchMock).toHaveBeenCalledWith(
        `https://api.github.com/users/${name}`,
        expect.anything(),
      );
    },
  );

  it("stops waiting when the caller aborts", async () => {
    hangUntilAborted();
    const request = new AbortController();

    const result = fetchProfile("octocat", request.signal);
    request.abort();

    expect(await result).toEqual({ status: "unavailable" });
  });

  it("gives up on a request that hangs for ten seconds", async () => {
    hangUntilAborted();
    const clock = new AbortController();
    const timeout = vi
      .spyOn(AbortSignal, "timeout")
      .mockReturnValue(clock.signal);

    const result = fetchProfile("octocat", freshSignal());
    clock.abort(new DOMException("Timed out", "TimeoutError"));

    expect(await result).toEqual({ status: "unavailable" });
    expect(timeout).toHaveBeenCalledWith(10_000);
  });
});
