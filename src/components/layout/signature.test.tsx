import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Signature from "./signature";

describe("Signature", () => {
  it("credits the author with a safe external link", () => {
    render(<Signature />);

    const link = screen.getByRole("link", { name: "Abdelrhman Abdelaal" });

    expect(screen.getByRole("contentinfo")).toHaveTextContent(
      "Coded by Abdelrhman Abdelaal.",
    );
    expect(link).toHaveAttribute(
      "href",
      "https://www.linkedin.com/in/abdelrhman-vanta/",
    );
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
