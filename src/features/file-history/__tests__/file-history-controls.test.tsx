import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { FileHistoryControls } from "@/features/file-history";
import { saveEditableFile } from "@/shared/lib/editable-files-storage";
import { useJsonDataStore } from "@/shared/stores";
import type { StoryData } from "@/shared/types";

const story: StoryData = {
  title: "Demo",
  start: "Intro",
  nodes: [
    {
      name: "Intro",
      content: ["Hi"],
      choices: [],
      metadata: {},
    },
  ],
};

describe("FileHistoryControls", () => {
  afterEach(() => {
    useJsonDataStore.getState().reset();
  });

  it("disables undo and redo when there is no edit history", () => {
    render(<FileHistoryControls />);

    expect(screen.getByRole("button", { name: /undo edit/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /redo edit/i })).toBeDisabled();
  });

  it("undoes and redoes edits from the header buttons", async () => {
    const user = userEvent.setup();
    saveEditableFile(
      { id: "demo-id", name: "demo", fileType: "twee", content: story },
      { now: () => 100 },
    );
    useJsonDataStore.getState().setJson(story, "demo", "demo-id");
    useJsonDataStore.getState().setName("renamed demo");

    render(<FileHistoryControls />);

    await user.click(screen.getByRole("button", { name: /undo edit/i }));

    expect(useJsonDataStore.getState().name).toBe("demo");
    expect(screen.getByRole("button", { name: /undo edit/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /redo edit/i })).toBeEnabled();

    await user.click(screen.getByRole("button", { name: /redo edit/i }));

    expect(useJsonDataStore.getState().name).toBe("renamed demo");
    expect(screen.getByRole("button", { name: /undo edit/i })).toBeEnabled();
    expect(screen.getByRole("button", { name: /redo edit/i })).toBeDisabled();
  });

  it("supports undo and redo keyboard shortcuts outside text inputs", () => {
    saveEditableFile(
      { id: "demo-id", name: "demo", fileType: "twee", content: story },
      { now: () => 100 },
    );
    useJsonDataStore.getState().setJson(story, "demo", "demo-id");
    useJsonDataStore.getState().setName("renamed demo");

    render(<FileHistoryControls />);

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          code: "KeyZ",
          ctrlKey: true,
          key: "z",
        }),
      );
    });

    expect(useJsonDataStore.getState().name).toBe("demo");

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          code: "KeyZ",
          ctrlKey: true,
          key: "z",
          shiftKey: true,
        }),
      );
    });

    expect(useJsonDataStore.getState().name).toBe("renamed demo");
  });

  it("keeps native text editing shortcuts inside text inputs", () => {
    saveEditableFile(
      { id: "demo-id", name: "demo", fileType: "twee", content: story },
      { now: () => 100 },
    );
    useJsonDataStore.getState().setJson(story, "demo", "demo-id");
    useJsonDataStore.getState().setName("renamed demo");

    render(
      <>
        <input aria-label="Draft text" />
        <FileHistoryControls />
      </>,
    );

    const draftText = screen.getByRole("textbox", { name: /draft text/i });
    draftText.focus();

    act(() => {
      draftText.dispatchEvent(
        new KeyboardEvent("keydown", {
          bubbles: true,
          code: "KeyZ",
          ctrlKey: true,
          key: "z",
        }),
      );
    });

    expect(useJsonDataStore.getState().name).toBe("renamed demo");
  });
});
