import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useJsonDataStore } from "@/shared/stores";

import { DownloadButton } from "@/features/download";

describe("DownloadButton", () => {
  const originalCreateElement = document.createElement.bind(document);
  const clickSpy = vi.fn();
  let createdAnchor: HTMLAnchorElement | null = null;

  beforeEach(() => {
    useJsonDataStore.getState().reset();
    clickSpy.mockReset();
    createdAnchor = null;
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
  });

  it("renders a Download button", () => {
    render(<DownloadButton />);
    const button = screen.getByRole("button", { name: /export json/i });
    expect(button).toHaveAttribute("aria-label", "Export JSON");
    expect(button).toHaveAttribute("data-size", "sm");
    expect(button).toHaveTextContent("Export JSON");
  });

  it("downloads the story as encoded JSON when clicked", async () => {
    const story = { title: "Demo", start: null, nodes: [] };
    useJsonDataStore.getState().setJson(story, "demo-story");

    document.createElement = ((tagName: string) => {
      const element = originalCreateElement(tagName);
      if (tagName === "a") {
        createdAnchor = element as HTMLAnchorElement;
        createdAnchor.click = clickSpy;
      }
      return element;
    }) as typeof document.createElement;

    render(<DownloadButton />);
    await userEvent.click(screen.getByRole("button", { name: /export json/i }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(createdAnchor?.download).toBe("demo-story.json");
    expect(createdAnchor?.href).toBe(
      "data:application/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(story, null, 2)),
    );
  });
});
