import { render, renderHook, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { useFaqModal } from "@/features/faq";

describe("useFaqModal", () => {
  it("returns a dialog content payload with the FAQ title and description", () => {
    const { result } = renderHook(() => useFaqModal());
    expect(result.current.title).toBe("FAQ");
    expect(result.current.description).toBe(
      "Import, edit, and export branching dialog.",
    );
    expect(result.current.isOpen).toBe(true);
    expect(result.current.functions).toEqual([]);
    expect(result.current.classNames?.dialog).toBe("sm:max-w-lg");
  });

  it("renders accordion questions, the visible sample hint, and a GitHub link", async () => {
    const user = userEvent.setup();
    const { result } = renderHook(() => useFaqModal());
    render(<div>{result.current.content}</div>);

    expect(
      screen.getByRole("button", { name: /what is unfurl\?/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /what are the supported formats\?/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/try a sample/i)).toBeInTheDocument();
    expect(screen.queryByText(/control \+ t \+ n/i)).not.toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: /source and contributing/i }),
    );
    expect(
      screen.getAllByRole("link", { name: /github/i }).length,
    ).toBeGreaterThan(0);
  });
});
