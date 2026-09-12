import { Link, useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
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
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

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

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <header className="flex shrink-0 flex-col gap-2 border-b bg-background p-3">
          <div
            data-testid="file-page-header"
            className="flex min-w-0 items-center rounded-lg bg-card px-2 py-1"
          >
            <InlineNameInput
              key={name || "Untitled"}
              id="file-name"
              label="File name"
              name={name}
              onCommit={setFileName}
              className="text-xl md:text-2xl"
            />
          </div>
          <div
            data-testid="file-toolbar"
            className="flex flex-wrap items-center justify-end gap-2"
          >
            <div
              data-testid="file-history-bubble"
              className="rounded-full border bg-card/90 p-1.5 shadow-lg backdrop-blur-md"
            >
              <FileHistoryControls />
            </div>
            <div
              data-testid="file-add-node-bubble"
              className="rounded-full border bg-card/90 p-1.5 shadow-lg backdrop-blur-md"
            >
              <GraphNodeToolbar />
            </div>
            <div
              data-testid="file-download-bubble"
              className="rounded-full border bg-card/90 p-1.5 shadow-lg backdrop-blur-md"
            >
              <DownloadButton />
            </div>
          </div>
          {!window.ipcRenderer ? (
            <p className="text-xs text-muted-foreground">
              Applied edits are saved in this browser. Export JSON to keep a
              backup.
            </p>
          ) : null}
        </header>
        <div className="file-workspace min-h-0 flex-1">
          <div
            className={
              node ? "file-editor-layout has-editor" : "file-editor-layout"
            }
          >
            <div className="file-graph-pane">
              <DialogViewer />
            </div>
            {node ? (
              <aside
                aria-label="Node editor"
                className="file-node-panel border-l bg-background p-3"
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
