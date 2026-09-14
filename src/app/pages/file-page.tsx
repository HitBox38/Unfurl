import { Link, useParams } from "@tanstack/react-router";
import { Loader2, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { DialogViewer } from "@/features/dialog-viewer";
import { useDialogViewerUiStore } from "@/features/dialog-viewer/hooks/use-dialog-viewer-ui-store";
import { GraphNodeToolbar } from "@/features/graph-node-toolbar";
import { DownloadButton } from "@/features/download";
import { FileHistoryControls } from "@/features/file-history";
import { NodeEditor } from "@/features/node-editor";
import { InlineNameInput } from "@/shared/components";
import { getEditableFile } from "@/shared/lib/editable-files-storage";
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
  const previousContentNodesRef = useRef(content.nodes);

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
            <div
              data-testid="file-history-bubble"
              className="workspace-bubble workspace-toolbar"
            >
              <FileHistoryControls />
            </div>
            <div
              data-testid="file-add-node-bubble"
              className="workspace-bubble workspace-toolbar"
            >
              <GraphNodeToolbar />
            </div>
            <div
              data-testid="file-download-bubble"
              className="flex"
            >
              <DownloadButton />
            </div>
          </div>
        </header>
        <div className="file-workspace min-h-0 flex-1">
          <div
            className={
              node ? "file-editor-layout has-editor" : "file-editor-layout"
            }
          >
            <div className="file-graph-pane relative">
              <DialogViewer />
              {showBlankStoryCue ? (
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
            {node ? (
              <aside
                aria-label="Node editor"
                className="file-node-panel"
              >
                <NodeEditor />
              </aside>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
};
