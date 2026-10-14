import { describe, expect, it } from "vitest";
import { avatarSrc, avatarSrcSet, formatJoined } from "./format";

const AVATAR = "https://avatars.githubusercontent.com/u/583231?v=4";

describe("formatJoined", () => {
  it.each([
    {
      when: "the API's timestamp",
      isoDate: "2011-01-25T18:44:36Z",
      expected: "25 Jan 2011",
    },
    {
      when: "September, which en-GB spells Sept",
      isoDate: "2015-09-08T12:00:00Z",
      expected: "8 Sep 2015",
    },
    {
      when: "a single-digit day",
      isoDate: "2020-03-01T12:00:00Z",
      expected: "1 Mar 2020",
    },
    {
      when: "the last UTC minute, already tomorrow east of UTC",
      isoDate: "2011-01-25T23:59:00Z",
      expected: "25 Jan 2011",
    },
    {
      when: "UTC midnight, still yesterday west of UTC",
      isoDate: "2011-01-25T00:00:00Z",
      expected: "25 Jan 2011",
    },
    {
      when: "New Year's Eve, already next year east of UTC",
      isoDate: "2010-12-31T23:30:00Z",
      expected: "31 Dec 2010",
    },
  ])("formats $when as $expected", ({ isoDate, expected }) => {
    expect(formatJoined(isoDate)).toBe(expected);
  });
});

describe("avatar sizes", () => {
  it("asks GitHub for the width the card draws", () => {
    expect(avatarSrc(AVATAR, 117)).toBe(`${AVATAR}&s=117`);
  });

  it("replaces a size already on the URL instead of adding a second", () => {
    expect(avatarSrc(`${AVATAR}&s=460`, 70)).toBe(`${AVATAR}&s=70`);
  });

  it("offers both card widths at 1x and 2x", () => {
    expect(avatarSrcSet(AVATAR)).toBe(
      `${AVATAR}&s=70 70w, ${AVATAR}&s=117 117w, ${AVATAR}&s=140 140w, ${AVATAR}&s=234 234w`,
    );
  });
});
