import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import NotFound, { metadata } from "./not-found";

describe("NotFound", () => {
  it("names the problem as the page heading, under the site header", () => {
    render(<NotFound />);

    expect(screen.getByRole("banner")).toHaveTextContent("devfinder");
    expect(screen.getAllByRole("heading")).toEqual([
      screen.getByRole("heading", { level: 1, name: "Page not found" }),
    ]);
  });

  it("offers exactly one way out, a real link back to the search", () => {
    render(<NotFound />);

    const link = screen.getByRole("link");
    expect(link).toHaveAccessibleName("Back to search");
    expect(link).toHaveAttribute("href", "/");
  });

  it("carries its own title and drops the home canonical", () => {
    expect(metadata.title).toBe("devfinder | Page not found");
    expect(metadata.alternates).toEqual({ canonical: null });
  });
});
