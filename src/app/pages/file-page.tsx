import { Link, useParams } from "@tanstack/react-router";
import { Code2, GitBranch, Loader2, Sparkles } from "lucide-react";
import { Activity, lazy, Suspense, useEffect, useRef, useState } from "react";

import { DialogViewer } from "@/features/dialog-viewer";
import { useDialogViewerUiStore } from "@/features/dialog-viewer/hooks/use-dialog-viewer-ui-store";
import { GraphNodeToolbar } from "@/features/graph-node-toolbar";
import { DownloadButton } from "@/features/download";
import { FileHistoryControls } from "@/features/file-history";
import { NodeEditor } from "@/features/node-editor";
import { StoryGraphPreview } from "@/features/story-graph-preview";
import { canApplyDraft, evaluateDraft, parseDocument, workspaceHasChanges } from "@/features/story-ide/draft";
import { useStoryIdeStore } from "@/features/story-ide/hooks/use-story-ide-store";
import { useConfirmDialog } from "@/shared/hooks/use-confirm-dialog";
import { useProject } from "@/shared/hooks/use-projects";
import { useStorageSnapshot } from "@/shared/hooks/use-storage-snapshot";
import { InlineNameInput } from "@/shared/components";
import { EDITABLE_FILES_STORAGE_KEY, getEditableFile } from "@/shared/lib/editable-files-storage";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import type { StoryData } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

const LazyStoryIde = lazy(() => import("@/features/story-ide"));

class FilePageState {
  static isBlankStory(content: StoryData) {
    const [startNode] = content.nodes;

    return (
      content.nodes.length === 1 &&
      content.start === startNode?.name &&
      startNode.content.every((line) => line.trim() === "") &&
      startNode.choices.length === 0
    );
  }
}

export const FilePage = () => {
  const { fileId } = useParams({ strict: false }) as { fileId?: string };
  const name = useJsonDataStore((state) => state.name);
  const activeFileId = useJsonDataStore((state) => state.activeFileId);
  const content = useJsonDataStore((state) => state.content);
  const setJsonData = useJsonDataStore((state) => state.setJson);
  const setFileName = useJsonDataStore((state) => state.setName);
  const resetJson = useJsonDataStore((state) => state.reset);
  const node = useNodeStore((state) => state.node);
  const isNewNode = useNodeStore((state) => state.isNew);
  const setSelectedNode = useNodeStore((state) => state.setNode);
  const [isMissing, setIsMissing] = useState(false);
  const [hasOpenedIde, setHasOpenedIde] = useState(false);
  const [visualEditorDirty, setVisualEditorDirty] = useState(false);
  const workspace = useStoryIdeStore((state) => fileId ? state.workspaces[fileId] : undefined);
  const initializeWorkspace = useStoryIdeStore((state) => state.initialize);
  const savedSnapshot = useStorageSnapshot(EDITABLE_FILES_STORAGE_KEY);
  const projectId = useJsonDataStore((state) => state.activeProjectId);
  const project = useProject(projectId);
  const confirm = useConfirmDialog();
  const previousContentNodesRef = useRef(content.nodes);

  useEffect(() => {
    void savedSnapshot;
    useJsonDataStore.getState().syncSavedFile();
  }, [savedSnapshot]);

  useEffect(() => {
    if (fileId && activeFileId === fileId) initializeWorkspace(fileId, content);
  }, [fileId, activeFileId, content, initializeWorkspace]);

  useEffect(() => {
    if (!fileId) return;
    const file = getEditableFile(fileId);
    if (!file) {
      setIsMissing(true);
      resetJson();
      setSelectedNode(null);
      useDialogViewerUiStore.getState().reset();
      return;
    }
    setIsMissing(false);
    setSelectedNode(null);
    useDialogViewerUiStore.getState().reset();
    setJsonData(file.content, file.name, file.id, file.projectId);
  }, [fileId, resetJson, setJsonData, setSelectedNode]);

  useEffect(() => {
    const previousNodes = previousContentNodesRef.current;
    previousContentNodesRef.current = content.nodes;
    if (!node || isNewNode) return;

    const matchingNode = content.nodes.find(
      (storyNode) => storyNode.name === node.name,
    );
    const previousNodeIndex = previousNodes.findIndex(
      (storyNode) => storyNode.name === node.name,
    );
    const selectedNode = matchingNode ?? content.nodes[previousNodeIndex];
    if (!selectedNode) {
      setSelectedNode(null);
      return;
    }
    if (selectedNode !== node) {
      setSelectedNode(selectedNode);
    }
  }, [content.nodes, node, isNewNode, setSelectedNode]);

  if (isMissing) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-6 text-left">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>File not found</CardTitle>
            <CardDescription>
              This file is not available in this browser. Return to projects to
              import a saved copy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">Back to projects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!fileId || activeFileId !== fileId) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <Loader2 className="animate-spin" aria-label="Loading editable file" />
      </div>
    );
  }

  const showBlankStoryCue = FilePageState.isBlankStory(content);
  const mode = workspace?.mode ?? "graph";
  const pending = Boolean(workspace && workspaceHasChanges(workspace));
  const draft = pending && workspace ? evaluateDraft(workspace, content, project?.metadataConfig) : null;
  const chooseMode = (next: "graph" | "ide") => {
    const switchView = () => {
      if (next === "ide") {
        setHasOpenedIde(true);
        const currentWorkspace = useStoryIdeStore.getState().workspaces[fileId];
        const document = currentWorkspace?.documents.find((entry) => entry.originalName === node?.name);
        if (document) useStoryIdeStore.getState().selectDocument(fileId, document.id);
      }
      useStoryIdeStore.getState().setMode(fileId, next);
    };
    if (next === "ide" && visualEditorDirty) {
      confirm({ title: "Open IDE with unsaved node edits?", description: "Keep editing to save the node first, or discard its unsaved form edits and open the IDE.", confirmLabel: "Discard form edits and open IDE", onConfirm: () => { setSelectedNode(null); setVisualEditorDirty(false); switchView(); } });
    } else switchView();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="file-header shrink-0 text-left">
          <div
            data-testid="file-page-header"
            className="file-title-bubble workspace-bubble flex min-h-10 min-w-0 items-center px-3 py-1"
          >
            <InlineNameInput
              key={name || "Untitled"}
              id="file-name"
              label="File name"
              name={name}
              onCommit={setFileName}
              className="text-base md:text-base"
            />
          </div>
          <div
            data-testid="file-toolbar"
            className="flex flex-wrap items-center gap-3"
          >
            <div className="workspace-bubble workspace-toolbar" role="group" aria-label="Story view">
              <Button variant={mode === "graph" ? "secondary" : "ghost"} size="sm" aria-pressed={mode === "graph"} onClick={() => chooseMode("graph")}><GitBranch className="size-4" aria-hidden="true" />Graph</Button>
              <Button variant={mode === "ide" ? "secondary" : "ghost"} size="sm" aria-pressed={mode === "ide"} onClick={() => chooseMode("ide")}><Code2 className="size-4" aria-hidden="true" />IDE</Button>
            </div>
            <div
              data-testid="file-history-bubble"
              className="workspace-bubble workspace-toolbar"
            >
              <FileHistoryControls disabled={pending} />
            </div>
            {mode === "graph" && !pending ? (
            <div
              data-testid="file-add-node-bubble"
              className="workspace-bubble workspace-toolbar"
            >
              <GraphNodeToolbar />
            </div>
            ) : null}
            <div
              data-testid="file-download-bubble"
              className="flex"
            >
              <DownloadButton />
            </div>
          </div>
        </header>
        <div className="file-workspace min-h-0 flex-1">
          {hasOpenedIde || mode === "ide" ? (
            <Activity mode={mode === "ide" ? "visible" : "hidden"}>
              <div className="h-full min-h-0 px-4 pb-4">
                <Suspense fallback={<div className="flex h-full items-center justify-center"><Loader2 className="animate-spin" aria-label="Loading story IDE" /></div>}><LazyStoryIde key={fileId} fileId={fileId} /></Suspense>
              </div>
            </Activity>
          ) : null}
          <Activity mode={mode === "graph" ? "visible" : "hidden"}>
          <div
            className={
              node && !pending ? "file-editor-layout has-editor" : "file-editor-layout"
            }
          >
            <div className="file-graph-pane relative">
              {pending && workspace ? <>
                <StoryGraphPreview story={workspace.lastValid} selectedName={parseDocument(workspace.documents.find((entry) => entry.id === workspace.activeId) ?? { id: "", originalName: null, text: "null" }).node?.name} onSelect={(selected) => {
                  const documentId = [...draft?.mergedByDocument ?? []].find(([, entry]) => entry.name === selected.name)?.[0]
                    ?? workspace.documents.find((entry) => entry.lastName === selected.name || entry.originalName === selected.name)?.id;
                  if (documentId) useStoryIdeStore.getState().selectDocument(fileId, documentId);
                  setHasOpenedIde(true); useStoryIdeStore.getState().setMode(fileId, "ide");
                }} />
                <div className="workspace-bubble absolute left-4 right-4 top-4 z-10 flex flex-wrap items-center justify-between gap-3 p-3 text-left text-sm"><span>{draft && canApplyDraft(draft) ? "Pending fix · Read-only graph preview" : "Pending fix · Last valid graph preview is out of date"}</span><Button size="sm" onClick={() => chooseMode("ide")}>Continue in IDE</Button></div>
              </> : <DialogViewer />}
              {showBlankStoryCue && !pending ? (
                <aside
                  aria-label="Blank story prompt"
                  className="workspace-bubble pointer-events-none absolute bottom-24 left-4 right-4 z-10 max-w-xs p-4 text-left text-sm"
                >
                  <p className="flex items-center gap-2 font-medium text-foreground">
                    <Sparkles className="size-4 text-primary" />
                    Give Start a first line.
                  </p>
                  <p className="mt-1 text-muted-foreground">
                    Then add a choice when the path branches.
                  </p>
                </aside>
              ) : null}
            </div>
            {node && !pending ? (
              <aside
                aria-label="Node editor"
                className="file-node-panel"
              >
                <NodeEditor onDirtyChange={setVisualEditorDirty} />
              </aside>
            ) : null}
          </div>
          </Activity>
        </div>
      </section>
    </div>
  );
};
