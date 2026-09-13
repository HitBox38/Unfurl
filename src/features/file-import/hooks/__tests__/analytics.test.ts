import { beforeEach, describe, expect, it, vi } from "vitest";

import { importFiles } from "@/features/file-import/hooks/use-import-files";
import { trackEvent, trackFirstGraphEdit } from "@/shared/lib/analytics";
import { downloadStoryAsJson } from "@/shared/lib/download-story-json";
import { useJsonDataStore } from "@/shared/stores";
import type { StoryData } from "@/shared/types";

vi.mock("@/shared/lib/analytics", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/shared/lib/analytics")>()),
  trackEvent: vi.fn(),
  trackFirstGraphEdit: vi.fn(),
}));

const story: StoryData = {
  title: "Private title",
  start: "Secret node",
  nodes: [
    {
      name: "Secret node",
      content: ["Private dialogue"],
      choices: [],
      metadata: {},
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
  useJsonDataStore.getState().reset();
});

describe("analytics at completed user actions", () => {
  it("reports each successful story, grouped Markdown once, and sanitized failures", async () => {
    await importFiles({
      projectId: "private-project",
      metadataConfig: { config: [] },
      markdownTitle: "Private story",
      files: [
        new File([JSON.stringify(story)], "private.json"),
        new File(["private invalid contents"], "broken.json"),
        new File(["{}"], "not-story.json"),
        new File(["Secret text"], "A.md"),
        new File(["More secret text"], "B.md"),
        new File(["Secret"], "private.txt"),
      ],
    });
    expect(vi.mocked(trackEvent).mock.calls).toEqual([
      [
        "import_failed",
        { format: "unknown", error_class: "unsupported_format" },
      ],
      ["import_succeeded", { format: "json", node_count_bucket: "1-20" }],
      ["import_failed", { format: "json", error_class: "invalid_json" }],
      ["import_failed", { format: "json", error_class: "invalid_story" }],
      ["import_succeeded", { format: "obsidian", node_count_bucket: "1-20" }],
    ]);
  });

  it("does not report file loads or no-op edits as activation", () => {
    const store = useJsonDataStore.getState();
    store.setJson(story, "Private file");
    store.setNode(story.nodes[0]);
    store.removeNode("missing");
    store.addNode(story.nodes[0]);
    expect(trackFirstGraphEdit).not.toHaveBeenCalled();
    store.setNode({ ...story.nodes[0], content: ["Edited private dialogue"] });
    expect(trackFirstGraphEdit).toHaveBeenCalledOnce();
  });

  it("tracks export initiation and sanitizes download failures", () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    downloadStoryAsJson("Private filename", story);
    expect(trackEvent).toHaveBeenLastCalledWith("export_succeeded", {
      format: "json",
      node_count_bucket: "1-20",
    });
    click.mockImplementation(() => {
      throw new Error("Secret path");
    });
    expect(() => downloadStoryAsJson("Private filename", story)).toThrow(
      "Secret path",
    );
    expect(trackEvent).toHaveBeenLastCalledWith("export_failed", {
      format: "json",
      node_count_bucket: "1-20",
      error_class: "download",
    });
    click.mockRestore();
  });
});
