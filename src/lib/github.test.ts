import { makeUser } from "@/test/github-user";
import { describe, expect, it } from "vitest";
import { toProfile } from "./github";

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
