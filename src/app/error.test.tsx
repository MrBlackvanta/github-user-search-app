import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import RootError from "./error";

function renderError() {
  const reset = vi.fn();
  render(<RootError error={new Error("boom")} reset={reset} />);
  return reset;
}

describe("RootError", () => {
  it("names the failure as the page heading, under the site header", () => {
    renderError();

    expect(screen.getByRole("banner")).toHaveTextContent("devfinder");
    expect(screen.getAllByRole("heading")).toEqual([
      screen.getByRole("heading", { level: 1, name: "Something went wrong" }),
    ]);
  });

  it("retries in place rather than linking back to the page it is on", async () => {
    const reset = renderError();

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(reset).toHaveBeenCalledOnce();
  });
});
