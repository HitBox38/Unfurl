import { renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { usePreviewGraph } from "@/features/story-graph-preview/hooks/use-preview-graph";
import { makeIdeStory } from "@/test/fixtures/story-ide";

describe("IDE graph selection", () => {
  it("selects and reveals the active node when the IDE selection changes", async () => {
    const story = makeIdeStory();
    const fitView = vi.fn();
    const { result, rerender } = renderHook(
      ({ selectedName }) => usePreviewGraph(story, selectedName, true),
      { initialProps: { selectedName: "Intro" } },
    );
    result.current.fitPreview.current = fitView;
    await waitFor(() => expect(fitView).toHaveBeenLastCalledWith({
      nodes: [{ id: "Intro" }, { id: "Outro" }], padding: 0.3, maxZoom: 1,
    }));

    rerender({ selectedName: "Outro" });

    expect(result.current.graph.nodes.filter((node) => node.selected).map((node) => node.id))
      .toEqual(["Outro"]);
    await waitFor(() => expect(fitView).toHaveBeenLastCalledWith({
      nodes: [{ id: "Intro" }, { id: "Outro" }], padding: 0.3, maxZoom: 1,
    }));
  });

  it("includes incoming and outgoing neighbors without following further connections", async () => {
    const story = makeIdeStory();
    story.nodes.push(
      { ...story.nodes[1], name: "Before", choices: [
        { text: "Begin", destination: "Intro" },
        { text: "Other path", destination: "Unrelated" },
      ] },
      { ...story.nodes[1], name: "Unrelated" },
    );
    const fitView = vi.fn();
    const { result } = renderHook(() => usePreviewGraph(story, "Intro", true));
    result.current.fitPreview.current = fitView;

    await waitFor(() => expect(fitView).toHaveBeenCalledWith({
      nodes: [{ id: "Intro" }, { id: "Outro" }, { id: "Before" }],
      padding: 0.3,
      maxZoom: 1,
    }));
    expect(result.current.graph.nodes.filter((node) => node.selected).map((node) => node.id))
      .toEqual(["Intro"]);
  });

  it("still reveals an isolated selected node", async () => {
    const story = makeIdeStory();
    story.nodes[0].choices = [];
    const fitView = vi.fn();
    const { result } = renderHook(() => usePreviewGraph(story, "Outro", true));
    result.current.fitPreview.current = fitView;
    await waitFor(() => expect(fitView).toHaveBeenCalledWith({
      nodes: [{ id: "Outro" }], padding: 0.3, maxZoom: 1,
    }));
  });

  it("fits the whole preview when the selected draft node is missing", async () => {
    const fitView = vi.fn();
    const { result } = renderHook(() => usePreviewGraph(makeIdeStory(), "Missing", true));
    result.current.fitPreview.current = fitView;
    await waitFor(() => expect(fitView).toHaveBeenCalledWith({ padding: 0.3, maxZoom: 1 }));
    expect(result.current.graph.nodes.some((node) => node.selected)).toBe(false);
  });

  it("keeps the full story visible in the large graph preview", async () => {
    const fitView = vi.fn();
    const { result } = renderHook(() => usePreviewGraph(makeIdeStory(), "Intro", false));
    result.current.fitPreview.current = fitView;
    await waitFor(() => expect(fitView).toHaveBeenCalledWith({ padding: 0.15, maxZoom: 1 }));
  });
});
