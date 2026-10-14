import { toProfile, type GitHubUser } from "@/lib/github";
import { makeUser } from "@/test/github-user";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ProfileCard from "./profile-card";

function renderCard(overrides: Partial<GitHubUser> = {}) {
  render(<ProfileCard profile={toProfile(makeUser(overrides))} />);
}

function definitionOf(term: string) {
  const terms = screen.getAllByRole("term");
  const index = terms.findIndex((element) => element.textContent === term);
  expect(index, `no "${term}" term`).toBeGreaterThanOrEqual(0);
  return screen.getAllByRole("definition")[index];
}

describe("ProfileCard", () => {
  it("is an article named by the user's name heading", () => {
    renderCard();

    const card = screen.getByRole("article", { name: "The Octocat" });
    expect(
      within(card).getByRole("heading", { level: 2, name: "The Octocat" }),
    ).toBeInTheDocument();
  });

  it("keeps the avatar out of the accessibility tree", () => {
    renderCard();

    expect(screen.getByRole("presentation")).toHaveAttribute("alt", "");
  });

  it("links the handle to the GitHub profile", () => {
    renderCard();

    expect(screen.getByRole("link", { name: "@octocat" })).toHaveAttribute(
      "href",
      "https://github.com/octocat",
    );
  });

  it("dates the join in UTC with a machine-readable time", () => {
    renderCard({ created_at: "2011-01-25T23:59:00Z" });

    expect(screen.getByRole("article")).toHaveTextContent("Joined 25 Jan 2011");
    expect(screen.getByText("25 Jan 2011")).toHaveAttribute(
      "dateTime",
      "2011-01-25T23:59:00Z",
    );
  });

  it("says so when there is no bio", () => {
    renderCard({ bio: null });

    expect(screen.getByText("This profile has no bio")).toBeInTheDocument();
  });

  it("pairs each count with its label", () => {
    renderCard({ public_repos: 8, followers: 24580, following: 9 });

    expect(definitionOf("Repos")).toHaveTextContent(/^8$/);
    expect(definitionOf("Followers")).toHaveTextContent(/^24580$/);
    expect(definitionOf("Following")).toHaveTextContent(/^9$/);
  });

  it("names each detail and links the ones that lead somewhere", () => {
    renderCard({ twitter_username: "octocat" });

    expect(definitionOf("Location")).toHaveTextContent("San Francisco");
    expect(within(definitionOf("Location")).queryByRole("link")).toBeNull();
    expect(
      within(definitionOf("Website")).getByRole("link", {
        name: "https://github.blog",
      }),
    ).toHaveAttribute("href", "https://github.blog");
    expect(
      within(definitionOf("Twitter")).getByRole("link", { name: "@octocat" }),
    ).toHaveAttribute("href", "https://x.com/octocat");
    expect(
      within(definitionOf("Company")).getByRole("link", { name: "@github" }),
    ).toHaveAttribute("href", "https://github.com/github");
  });

  it("marks every missing detail Not Available, never as a link", () => {
    renderCard({
      location: null,
      blog: "",
      twitter_username: null,
      company: null,
    });

    for (const term of ["Location", "Website", "Twitter", "Company"]) {
      expect(definitionOf(term)).toHaveTextContent("Not Available");
      expect(within(definitionOf(term)).queryByRole("link")).toBeNull();
    }
  });

  it("opens every outbound link in a new tab without an opener", () => {
    renderCard({ twitter_username: "octocat" });

    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(4);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });
});
