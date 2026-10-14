import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import SiteHeader from "./site-header";

describe("SiteHeader", () => {
  it("holds the logo and the theme switch in the banner", () => {
    render(<SiteHeader />);

    const banner = screen.getByRole("banner");

    expect(banner).toHaveTextContent("devfinder");
    expect(
      within(banner).getByRole("button", { name: "Dark theme" }),
    ).toBeVisible();
  });

  it("makes the logo the page heading only when asked", () => {
    const { rerender } = render(<SiteHeader />);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();

    rerender(<SiteHeader logoAs="h1" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "devfinder" }),
    ).toBeVisible();
  });
});
