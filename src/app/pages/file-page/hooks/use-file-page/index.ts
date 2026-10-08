import { useParams } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";

import { useDialogViewerUiStore } from "@/features/dialog-viewer/hooks/use-dialog-viewer-ui-store";
import { evaluateDraft, workspaceHasChanges } from "@/features/story-ide/draft";
import { useStoryIdeStore } from "@/features/story-ide/hooks/use-story-ide-store";
import { useConfirmDialog } from "@/shared/hooks/use-confirm-dialog";
import { useProject } from "@/shared/hooks/use-projects";
import { useStorageSnapshot } from "@/shared/hooks/use-storage-snapshot";
import {
  EDITABLE_FILES_STORAGE_KEY,
  getEditableFile,
} from "@/shared/lib/editable-files-storage";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import type { StoryNode } from "@/shared/types";
import { isBlankStory } from "@/app/pages/file-page/helpers";

export const useFilePage = () => {
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
  const workspace = useStoryIdeStore((state) =>
    fileId ? state.workspaces[fileId] : undefined,
  );
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

  const showBlankStoryCue = isBlankStory(content);
  const mode = workspace?.mode ?? "graph";
  const pending = Boolean(workspace && workspaceHasChanges(workspace));
  const draft =
    pending && workspace
      ? evaluateDraft(workspace, content, project?.metadataConfig)
      : null;
  const chooseMode = (next: "graph" | "ide") => {
    if (!fileId) return;
    const switchView = () => {
      if (next === "ide") {
        setHasOpenedIde(true);
        const currentWorkspace = useStoryIdeStore.getState().workspaces[fileId];
        const document = currentWorkspace?.documents.find(
          (entry) => entry.originalName === node?.name,
        );
        if (document)
          useStoryIdeStore.getState().selectDocument(fileId, document.id);
      }
      useStoryIdeStore.getState().setMode(fileId, next);
    };
    if (next === "ide" && visualEditorDirty) {
      confirm({
        title: "Open IDE with unsaved node edits?",
        description:
          "Keep editing to save the node first, or discard its unsaved form edits and open the IDE.",
        confirmLabel: "Discard form edits and open IDE",
        onConfirm: () => {
          setSelectedNode(null);
          setVisualEditorDirty(false);
          switchView();
        },
      });
    } else switchView();
  };

  const selectPreview = (selected: StoryNode) => {
    if (!fileId || !workspace) return;
    const documentId =
      [...(draft?.mergedByDocument ?? [])].find(
        ([, entry]) => entry.name === selected.name,
      )?.[0] ??
      workspace.documents.find(
        (entry) =>
          entry.lastName === selected.name ||
          entry.originalName === selected.name,
      )?.id;
    if (documentId)
      useStoryIdeStore.getState().selectDocument(fileId, documentId);
    setHasOpenedIde(true);
    useStoryIdeStore.getState().setMode(fileId, "ide");
  };
  return {
    fileId,
    activeFileId,
    isMissing,
    name,
    setFileName,
    node,
    setVisualEditorDirty,
    workspace,
    draft,
    showBlankStoryCue,
    mode,
    pending,
    chooseMode,
    hasOpenedIde,
    selectPreview,
  };
};
export type FilePageController = ReturnType<typeof useFilePage>;
