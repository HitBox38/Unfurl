import { useMemo, useState } from "react";

import { useConfirmDialog } from "@/shared/hooks/use-confirm-dialog";
import { useProject } from "@/shared/hooks/use-projects";
import { getEditableFile } from "@/shared/lib/editable-files-storage";
import { getProject } from "@/shared/lib/projects-storage";
import { downloadJsonFile } from "@/shared/lib/download-json-file";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import type { StoryNode } from "@/shared/types";
import {
  canApplyDraft,
  draftChanges,
  evaluateDraft,
  parseDocument,
  workspaceHasChanges,
} from "@/features/story-ide/draft";
import { useStoryIdeStore } from "@/features/story-ide/hooks/use-story-ide-store";
import { valuesEqual } from "@/features/story-ide/merge";
import type { EditorLocation, SearchMatch } from "@/features/story-ide/types";

export const useStoryIdeController = (fileId: string) => {
  const workspace = useStoryIdeStore((state) => state.workspaces[fileId]);
  const storageError = useStoryIdeStore((state) => state.storageError);
  const saved = useJsonDataStore((state) => state.content);
  const projectId = useJsonDataStore((state) => state.activeProjectId);
  const project = useProject(projectId);
  const confirm = useConfirmDialog();
  const [sidebar, setSidebar] = useState<"nodes" | "search">("nodes");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [location, setLocation] = useState<EditorLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const base = workspace?.base;
  const documents = workspace?.documents;
  const resolutions = workspace?.resolutions;
  const result = useMemo(
    () =>
      base && documents && resolutions
        ? evaluateDraft(
            { base, documents, resolutions },
            saved,
            project?.metadataConfig,
          )
        : null,
    [base, documents, resolutions, saved, project?.metadataConfig],
  );
  const pending = useMemo(
    () =>
      base && documents ? workspaceHasChanges({ base, documents }) : false,
    [base, documents],
  );
  const activeDocument = workspace?.documents.find(
    (document) => document.id === workspace.activeId,
  );
  const activeNode =
    activeDocument && result?.nodesByDocument.get(activeDocument.id);
  const activeIssues = useMemo(
    () =>
      result?.issues.filter(
        (issue) => issue.documentId === activeDocument?.id,
      ) ?? [],
    [result, activeDocument?.id],
  );
  const actions = useStoryIdeStore.getState();
  const select = (
    documentId: string,
    path?: SearchMatch["path"],
    key?: boolean,
  ) => {
    actions.selectDocument(fileId, documentId);
    const document = workspace?.documents.find(
      (entry) => entry.id === documentId,
    );
    const node = saved.nodes.find(
      (entry) => entry.name === document?.originalName,
    );
    if (node) useNodeStore.getState().setNode(node);
    if (path) setLocation({ documentId, path, key, token: Date.now() });
  };
  const selectPreview = (node: StoryNode) => {
    const documentId =
      [...(result?.mergedByDocument ?? [])].find(
        ([, entry]) => entry.name === node.name,
      )?.[0] ??
      workspace?.documents.find(
        (entry) =>
          entry.lastName === node.name || entry.originalName === node.name,
      )?.id;
    if (documentId) select(documentId);
  };
  const currentResult = () => {
    const currentWorkspace = useStoryIdeStore.getState().workspaces[fileId];
    const file = getEditableFile(fileId);
    if (!currentWorkspace || !file)
      throw new Error("The saved story is no longer available.");
    if (!valuesEqual(file.content, saved)) {
      useJsonDataStore.getState().syncSavedFile();
      throw new Error("The saved story changed. Review the merged fix again.");
    }
    const currentProject = getProject(file.projectId);
    const next = evaluateDraft(
      currentWorkspace,
      file.content,
      currentProject?.metadataConfig,
    );
    if (!canApplyDraft(next) || !next.story)
      throw new Error(
        "Resolve validation errors and conflicts before continuing.",
      );
    return { next, file };
  };
  const apply = () => {
    try {
      const { next, file } = currentResult();
      const selected =
        activeDocument && next.mergedByDocument.get(activeDocument.id);
      useJsonDataStore.getState().applyStory(next.story!, file.content);
      actions.reset(fileId, next.story!);
      if (selected) useNodeStore.getState().setNode(selected);
      setReviewOpen(false);
      setError(null);
      setNotice("Complete fix applied. You can undo it from file history.");
    } catch (failure) {
      setError(
        failure instanceof Error ? failure.message : "Could not apply the fix.",
      );
    }
  };
  const exportTestCopy = () => {
    try {
      const { next, file } = currentResult();
      downloadJsonFile(`${file.name || "story"}-test-copy.json`, next.story);
      setError(null);
      setNotice("Test copy exported. The saved story has not changed.");
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not export the test copy.",
      );
    }
  };
  const discard = () =>
    confirm({
      title: "Discard pending story fix?",
      description:
        "Discard the node drafts and return to the latest saved story. Open tabs and search will be kept.",
      confirmLabel: "Discard fix",
      onConfirm: () => {
        actions.reset(fileId, getEditableFile(fileId)?.content ?? saved);
        setError(null);
        setNotice("Pending fix discarded.");
      },
    });

  if (!workspace || !result) return null;
  const errors = result.issues.filter(
    (issue) => issue.severity === "error",
  ).length;
  const warnings = result.issues.length - errors;
  const valid = canApplyDraft(result);
  const previewCurrent =
    valid && valuesEqual(result.story, workspace.lastValid);
  const changedNodes = result.story
    ? draftChanges(saved, result.story).length
    : workspace.documents.filter(
        (document) =>
          document.deleted ||
          !document.originalName ||
          !valuesEqual(
            parseDocument(document).node,
            workspace.base.nodes.find(
              (node) => node.name === document.originalName,
            ),
          ),
      ).length;

  return {
    fileId,
    workspace,
    storageError,
    saved,
    projectId,
    project,
    sidebar,
    setSidebar,
    reviewOpen,
    setReviewOpen,
    location,
    error,
    setError,
    notice,
    setNotice,
    result,
    pending,
    activeDocument,
    activeNode,
    activeIssues,
    actions,
    select,
    selectPreview,
    apply,
    exportTestCopy,
    discard,
    errors,
    warnings,
    valid,
    previewCurrent,
    changedNodes,
  };
};
export type StoryIdeController = NonNullable<
  ReturnType<typeof useStoryIdeController>
>;
