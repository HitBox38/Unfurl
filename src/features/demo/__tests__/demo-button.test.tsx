import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getEditableFile } from "@/shared/lib/editable-files-storage";
import { fromTwee } from "@/shared/lib/convertors";
import { useJsonDataStore } from "@/shared/stores";
import type { StoryData } from "@/shared/types";

import { DemoButton } from "@/features/demo";

const { navigate } = vi.hoisted(() => ({
  navigate: vi.fn(),
}));

vi.mock("@tanstack/react-router", () => ({
  useNavigate: () => navigate,
}));

vi.mock("@/shared/lib/convertors", () => ({
  fromTwee: vi.fn(),
}));

const demoStory: StoryData = {
  title: "Demo Story",
  start: "Start",
  nodes: [
    {
      name: "Start",
      content: ["Hello"],
      choices: [],
      metadata: {},
    },
  ],
};

const revealDemoButton = () => {
  for (const code of [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "KeyB",
    "KeyA",
  ]) {
    fireEvent.keyDown(window, { code });
  }
};

describe("DemoButton", () => {
  beforeEach(() => {
    navigate.mockReset();
    vi.mocked(fromTwee).mockResolvedValue(demoStory);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(":: Start\nHello")),
    );
    useJsonDataStore.getState().reset();
  });

  it("loads the demo as an editable file route", async () => {
    render(<DemoButton />);
    revealDemoButton();

    await userEvent.click(
      await screen.findByRole("button", { name: /load demo file/i }),
    );

    await waitFor(() => expect(navigate).toHaveBeenCalled());
    const activeFileId = useJsonDataStore.getState().activeFileId;
    expect(activeFileId).toEqual(expect.any(String));
    expect(getEditableFile(activeFileId ?? "")?.content).toEqual(demoStory);
    expect(navigate).toHaveBeenCalledWith({
      to: "/files/$fileId",
      params: { fileId: activeFileId },
    });
  });
});
