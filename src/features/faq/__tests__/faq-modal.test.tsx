import { render, screen } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useFaqModal } from "@/features/faq";

describe("useFaqModal", () => {
  it("returns a dialog content payload with the FAQ title", () => {
    const { result } = renderHook(() => useFaqModal());
    expect(result.current.title).toBe("FAQ");
    expect(result.current.isOpen).toBe(true);
    expect(result.current.functions).toEqual([]);
  });

  it("renders the FAQ sections including the GitHub link", () => {
    const { result } = renderHook(() => useFaqModal());
    render(<div>{result.current.content}</div>);
    expect(screen.getByText(/what is unfurl\?/i)).toBeInTheDocument();
    expect(
      screen.getByText(/what are the supported formats\?/i),
    ).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", { name: /github/i }).length,
    ).toBeGreaterThan(0);
  });
});
