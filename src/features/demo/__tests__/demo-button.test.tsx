import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { getEditableFile } from "@/shared/lib/editable-files-storage";
import { fromTwee } from "@/shared/lib/convertors";
import { createProject } from "@/shared/lib/projects-storage";
import { useJsonDataStore } from "@/shared/stores";
import type { MetadataConfigTemplate, StoryData } from "@/shared/types";

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

const metadataConfig: MetadataConfigTemplate = {
  config: [{ name: "gold", sign: "$gold", type: "number" }],
};

describe("DemoButton", () => {
  beforeEach(() => {
    navigate.mockReset();
    vi.mocked(fromTwee).mockReset();
    vi.mocked(fromTwee).mockResolvedValue(demoStory);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response(":: Start\nHello")),
    );
    useJsonDataStore.getState().reset();
  });

  it("loads the demo into the first project as an editable file route", async () => {
    const project = createProject(
      { name: "First", metadataConfig },
      { now: () => 1 },
    );
    createProject({ name: "Second" }, { now: () => 2 });

    render(<DemoButton />);

    await userEvent.click(
      await screen.findByRole("button", { name: /try a sample/i }),
    );

    await waitFor(() => expect(navigate).toHaveBeenCalled());
    const { activeFileId, activeProjectId } = useJsonDataStore.getState();
    expect(activeFileId).toEqual(expect.any(String));
    expect(activeProjectId).toBe(project.id);
    expect(getEditableFile(activeFileId ?? "")).toMatchObject({
      content: demoStory,
      projectId: project.id,
    });
    expect(fromTwee).toHaveBeenCalledWith(expect.any(File), {
      config: metadataConfig,
    });
    expect(navigate).toHaveBeenCalledWith({
      to: "/files/$fileId",
      params: { fileId: activeFileId },
    });
  });
});
