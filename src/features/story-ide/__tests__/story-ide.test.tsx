import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { FilePage } from "@/app/pages/file-page";
import { serializeNode } from "@/features/story-ide/draft";
import { useStoryIdeStore } from "@/features/story-ide/hooks/use-story-ide-store";
import type { EditorLocation, NodeDocument } from "@/features/story-ide/types";
import { getEditableFile, saveEditableFile, updateEditableFileContent } from "@/shared/lib/editable-files-storage";
import { createProject } from "@/shared/lib/projects-storage";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import { ideMetadata, makeIdeStory } from "@/test/fixtures/story-ide";

const { download } = vi.hoisted(() => ({ download: vi.fn() }));
vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to }: { children: ReactNode; to: string }) => <a href={to}>{children}</a>,
  useParams: () => ({ fileId: "file" }),
}));
vi.mock("@/features/dialog-viewer", () => ({ DialogViewer: () => <div>Saved graph</div> }));
vi.mock("@/features/story-graph-preview", () => ({ StoryGraphPreview: () => <div>Read-only preview</div> }));
vi.mock("@/features/graph-node-toolbar", () => ({ GraphNodeToolbar: () => <button>Add saved node</button> }));
vi.mock("@/features/node-editor", () => ({ NodeEditor: () => <div>Visual node editor</div> }));
vi.mock("@/shared/lib/download-json-file", () => ({ downloadJsonFile: download }));
vi.mock("@/features/story-ide/components/json-node-editor", () => ({
  JsonNodeEditor: ({ document, location, onChange }: { document: NodeDocument; location: EditorLocation | null; onChange: (text: string) => void }) => (
    <textarea aria-label="Node JSON editor" data-location={JSON.stringify(location?.path)} value={document.text} onChange={(event) => onChange(event.target.value)} />
  ),
}));

const editor = () => screen.getByRole("textbox", { name: "Node JSON editor" });
const savedRewards = () => getEditableFile("file")!.content.nodes.map((node) => node.metadata.reward);
const openIde = async (user: ReturnType<typeof userEvent.setup>) => {
  await screen.findByRole("tab", { name: "IDE" });
  await user.click(screen.getByRole("tab", { name: "IDE" }));
  await screen.findByRole("textbox", { name: "Node JSON editor" });
};

describe("story IDE editing flow", () => {
  beforeEach(() => {
    useJsonDataStore.getState().reset(); useNodeStore.getState().setNode(null);
    useStoryIdeStore.setState({ workspaces: {}, storageError: null }); download.mockClear();
    createProject({ name: "Game", metadataConfig: ideMetadata }, { createId: () => "project" });
    saveEditableFile({ id: "file", projectId: "project", name: "quest", fileType: "json", content: makeIdeStory() });
  });

  it("stages field-aware replacements, exports the fix, and applies every node in one undoable action", async () => {
    const user = userEvent.setup(); render(<FilePage />); await openIde(user);
    await user.click(screen.getByRole("button", { name: "Search" }));
    await user.click(screen.getByRole("combobox", { name: "Search scope" }));
    await user.click(await screen.findByRole("option", { name: "Metadata values" }));
    await user.type(screen.getByRole("textbox", { name: "Metadata field filter" }), "reward");
    await user.type(screen.getByRole("textbox", { name: "Search story data" }), "100");
    await user.type(screen.getByRole("textbox", { name: "Replacement value" }), "25");
    await user.click(screen.getByRole("button", { name: /Intro.*reward/ }));
    expect(editor()).toHaveAttribute("data-location", '["metadata","reward"]');
    await user.click(screen.getByRole("button", { name: "Preview replacements" }));
    expect(screen.getByRole("dialog")).toHaveTextContent("2 field changes across 2 nodes");
    await user.click(screen.getByRole("button", { name: "Stage replacements" }));
    expect(savedRewards()).toEqual([100, 100]);
    expect(JSON.parse((editor() as HTMLTextAreaElement).value)).toMatchObject({ content: ["Earn 100 coins."], metadata: { reward: 25 }, position: { x: 100 } });
    await user.click(screen.getByRole("button", { name: "Export test copy" }));
    expect(download).toHaveBeenCalledWith("quest-test-copy.json", expect.objectContaining({ nodes: expect.arrayContaining([expect.objectContaining({ metadata: { reward: 25, visited: false } })]) }));
    expect(savedRewards()).toEqual([100, 100]);
    await user.click(screen.getByRole("tab", { name: "Graph" }));
    expect(screen.getByRole("button", { name: "Undo edit" })).toBeDisabled();
    expect(screen.queryByRole("button", { name: "Add saved node" })).not.toBeInTheDocument();
    expect(screen.getByText("Pending fix · Read-only graph preview")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Continue in IDE" }));
    expect(screen.getByRole("textbox", { name: "Search story data" })).toHaveValue("100");
    await user.click(screen.getByRole("button", { name: "Review fix" }));
    expect(within(screen.getByRole("dialog")).getByRole("button", { name: /Outro/ })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Apply complete fix" }));
    expect(savedRewards()).toEqual([25, 25]);
    expect(useJsonDataStore.getState().past).toHaveLength(1);
    await user.click(screen.getByRole("button", { name: "Undo edit" }));
    expect(savedRewards()).toEqual([100, 100]);
    await user.click(screen.getByRole("button", { name: "Redo edit" }));
    expect(savedRewards()).toEqual([25, 25]);
  });

  it("uses keyboard-accessible node tabs and retains drafts after closing and reopening a tab", async () => {
    const user = userEvent.setup();
    render(<FilePage />);
    await openIde(user);
    await user.click(screen.getByRole("button", { name: "Outro" }));
    const intro = screen.getByRole("tab", { name: "Intro" });
    await user.click(intro);
    await user.keyboard("{ArrowRight}");
    const outro = screen.getByRole("tab", { name: "Outro" });
    await waitFor(() => expect(outro).toHaveFocus());
    expect(outro).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tabpanel", { name: "Outro" })).toContainElement(
      editor(),
    );
    await user.keyboard("{ArrowLeft}");
    await waitFor(() => expect(intro).toHaveAttribute("aria-selected", "true"));
    fireEvent.change(editor(), { target: { value: "{ pending tab draft" } });
    await user.click(screen.getByRole("button", { name: "Close tab Intro" }));
    expect(screen.queryByRole("tab", { name: /^Intro/ })).not.toBeInTheDocument();
    await waitFor(() => expect(outro).toHaveFocus());
    expect(outro).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("button", { name: /^Intro/ }));
    expect(editor()).toHaveValue("{ pending tab draft");
    expect(savedRewards()).toEqual([100, 100]);
  });

  it("recovers unfinished JSON after reopening and blocks Apply and test export", async () => {
    const user = userEvent.setup(); const page = render(<FilePage />); await openIde(user);
    fireEvent.change(editor(), { target: { value: "{ unfinished" } });
    expect(screen.getByText("Out of date")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Export test copy" })).toBeDisabled();
    page.unmount(); useStoryIdeStore.setState({ workspaces: {} });
    render(<FilePage />);
    expect(await screen.findByRole("textbox", { name: "Node JSON editor" })).toHaveValue("{ unfinished");
    expect(savedRewards()).toEqual([100, 100]);
    await user.click(screen.getByRole("button", { name: "Review fix" }));
    expect(screen.getByRole("button", { name: "Apply complete fix" })).toBeDisabled();
  });

  it("requires an explicit conflict choice before applying over a newly saved value", async () => {
    const user = userEvent.setup(); render(<FilePage />); await openIde(user);
    const story = makeIdeStory();
    fireEvent.change(editor(), { target: { value: serializeNode({ ...story.nodes[0], metadata: { reward: 25, visited: false } }) } });
    const saved = makeIdeStory(); saved.nodes[0].metadata.reward = 50;
    act(() => updateEditableFileContent("file", saved));
    await waitFor(() => expect(screen.getByText(/1 conflicts/)).toBeInTheDocument());
    await user.click(screen.getByRole("button", { name: "Review fix" }));
    expect(screen.getByRole("button", { name: "Apply complete fix" })).toBeDisabled();
    expect(screen.getByRole("dialog")).toHaveTextContent("Resolve conflict · Intro · metadata.reward");
    await user.click(screen.getByRole("button", { name: "Use draft value" }));
    await user.click(screen.getByRole("button", { name: "Apply complete fix" }));
    expect(savedRewards()).toEqual([25, 100]);
    await user.click(screen.getByRole("button", { name: "Undo edit" }));
    expect(savedRewards()).toEqual([50, 100]);
  });
});
