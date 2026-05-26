import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useJsonDataStore } from "@/shared/stores";

import { DownloadButton } from "@/features/download/download-button";

describe("DownloadButton", () => {
  const originalCreateElement = document.createElement.bind(document);
  const clickSpy = vi.fn();
  const setAttributeSpy = vi.fn();

  beforeEach(() => {
    useJsonDataStore.getState().reset();
    clickSpy.mockReset();
    setAttributeSpy.mockReset();
  });

  afterEach(() => {
    document.createElement = originalCreateElement;
  });

  it("renders a Download button", () => {
    render(<DownloadButton />);
    const button = screen.getByRole("button", { name: /download/i });
    expect(button).toHaveAttribute("aria-label", "Download");
    expect(button).toHaveAttribute("data-size", "icon-sm");
    expect(button).toHaveTextContent("");
  });

  it("creates a download anchor with the encoded JSON when clicked", async () => {
    useJsonDataStore.getState().setJson(
      {
        title: "Demo",
        start: null,
        nodes: [],
      },
      "demo-story",
    );

    document.createElement = ((tagName: string) => {
      if (tagName === "a") {
        const anchor = originalCreateElement("a") as HTMLAnchorElement;
        anchor.setAttribute = ((name: string, value: string) => {
          setAttributeSpy(name, value);
          return HTMLElement.prototype.setAttribute.call(anchor, name, value);
        }) as HTMLAnchorElement["setAttribute"];
        anchor.click = clickSpy;
        return anchor;
      }
      return originalCreateElement(tagName);
    }) as typeof document.createElement;

    render(<DownloadButton />);
    await userEvent.click(screen.getByRole("button", { name: /download/i }));

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(setAttributeSpy).toHaveBeenCalledWith(
      "download",
      "demo-story.json",
    );
    const hrefCall = setAttributeSpy.mock.calls.find(
      (call) => call[0] === "href",
    );
    expect(hrefCall?.[1]).toMatch(/^data:text\/json;charset=utf-8,/);
  });
});
