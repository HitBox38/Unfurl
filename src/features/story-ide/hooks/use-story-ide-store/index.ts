import { create } from "zustand";

import { getEditableFile } from "@/shared/lib/editable-files-storage";
import { getProject } from "@/shared/lib/projects-storage";
import { createStoryNode } from "@/shared/lib/create-story-node";
import type { StoryData } from "@/shared/types";
import { canApplyDraft, createWorkspace, evaluateDraft, rebaseWorkspace, serializeNode, stageDocuments, workspaceHasChanges } from "@/features/story-ide/draft";
import { valuesEqual } from "@/features/story-ide/merge";
import type { IdeWorkspace, StorySearch } from "@/features/story-ide/types";

export const workspaceStorageKey = (fileId: string) => `unfurl:story-ide:v1:${fileId}`;
const unreadableCopies = new Map<string, { key: string; raw: string }>();
const preserveUnreadableCopy = (fileId: string) => {
  const copy = unreadableCopies.get(fileId);
  if (!copy) return;
  localStorage.setItem(copy.key, copy.raw);
  unreadableCopies.delete(fileId);
};

interface StoryIdeState {
  workspaces: Record<string, IdeWorkspace>;
  storageError: string | null;
  initialize: (fileId: string, saved: StoryData) => void;
  update: (fileId: string, edit: (workspace: IdeWorkspace) => IdeWorkspace, preview?: boolean) => void;
  editDocument: (fileId: string, documentId: string, text: string) => void;
  selectDocument: (fileId: string, documentId: string) => void;
  closeTab: (fileId: string, documentId: string) => void;
  setSearch: (fileId: string, search: Partial<StorySearch>) => void;
  setMode: (fileId: string, mode: "graph" | "ide") => void;
  addNode: (fileId: string) => void;
  deleteNode: (fileId: string, documentId: string) => void;
  resolve: (fileId: string, conflictId: string, resolution: "saved" | "draft") => void;
  reset: (fileId: string, story: StoryData) => void;
  refreshPreview: (fileId: string) => void;
}

const recoverWorkspace = (fileId: string): IdeWorkspace | null => {
  const raw = localStorage.getItem(workspaceStorageKey(fileId));
  if (!raw) return null;
  const value = JSON.parse(raw) as IdeWorkspace;
  if (value.version !== 1 || value.fileId !== fileId || !Array.isArray(value.documents) || !Array.isArray(value.tabs) || !value.base?.nodes || !value.search || !value.lastValid?.nodes || !value.resolutions) {
    throw new Error("The recovered draft could not be read. Its stored copy has been preserved.");
  }
  if (value.documents.some((document) => typeof document.id !== "string" || typeof document.text !== "string" || (document.originalName !== null && typeof document.originalName !== "string"))) {
    throw new Error("The recovered node drafts could not be read. Their stored copy has been preserved.");
  }
  return value;
};

const previewWorkspace = (workspace: IdeWorkspace) => {
  const file = getEditableFile(workspace.fileId);
  const project = file ? getProject(file.projectId) : null;
  const result = evaluateDraft(workspace, file?.content ?? workspace.base, project?.metadataConfig);
  const rebased = rebaseWorkspace(workspace, file?.content ?? workspace.base, result);
  return canApplyDraft(result) && result.story && !valuesEqual(result.story, rebased.lastValid) ? { ...rebased, lastValid: result.story } : rebased;
};

export const useStoryIdeStore = create<StoryIdeState>((set, get) => ({
  workspaces: {},
  storageError: null,
  initialize: (fileId, saved) => {
    try {
      const existing = get().workspaces[fileId] ?? recoverWorkspace(fileId);
      if (existing && (workspaceHasChanges(existing) || valuesEqual(existing.base, saved))) {
        const originalNames = new Set(existing.base.nodes.map((node) => node.name));
        const additions = saved.nodes.filter((node) => !originalNames.has(node.name));
        const next = additions.length ? {
          ...existing, base: { ...existing.base, nodes: [...existing.base.nodes, ...additions] },
          documents: [...existing.documents, ...additions.map((node) => ({ id: crypto.randomUUID(), originalName: node.name, lastName: node.name, text: serializeNode(node) }))],
        } : existing;
        set((state) => ({ workspaces: { ...state.workspaces, [fileId]: previewWorkspace(next) } }));
      } else {
        const workspace = createWorkspace(fileId, saved);
        if (existing) {
          workspace.mode = existing.mode;
          workspace.search = existing.search;
          const names = existing.documents.filter((document) => existing.tabs.includes(document.id)).map((document) => document.originalName);
          workspace.tabs = workspace.documents.filter((document) => names.includes(document.originalName)).map((document) => document.id);
          const active = existing.documents.find((document) => document.id === existing.activeId)?.originalName;
          workspace.activeId = workspace.documents.find((document) => document.originalName === active)?.id ?? workspace.tabs[0] ?? null;
        }
        set((state) => ({ workspaces: { ...state.workspaces, [fileId]: workspace } }));
      }
    } catch (error) {
      try {
        const unreadable = localStorage.getItem(workspaceStorageKey(fileId));
        if (unreadable) unreadableCopies.set(fileId, { key: `${workspaceStorageKey(fileId)}:unreadable:${Date.now()}`, raw: unreadable });
        preserveUnreadableCopy(fileId);
      } catch { /* A later save must archive the unreadable copy before replacing its key. */ }
      set((state) => ({ workspaces: { ...state.workspaces, [fileId]: createWorkspace(fileId, saved) }, storageError: error instanceof Error ? error.message : "Draft recovery failed." }));
    }
  },
  update: (fileId, edit, preview = false) => {
    const current = get().workspaces[fileId];
    if (!current) return;
    let workspace = edit(current);
    if (preview) workspace = previewWorkspace(workspace);
    let storageError: string | null = null;
    try { preserveUnreadableCopy(fileId); localStorage.setItem(workspaceStorageKey(fileId), JSON.stringify(workspace)); }
    catch { storageError = "Draft recovery could not be saved. Keep this window open and export a test copy when the draft is valid."; }
    set((state) => ({ workspaces: { ...state.workspaces, [fileId]: workspace }, storageError }));
  },
  editDocument: (fileId, documentId, text) => get().update(fileId, (workspace) => stageDocuments(workspace,
    workspace.documents.map((document) => document.id === documentId ? { ...document, text } : document),
  ), true),
  selectDocument: (fileId, documentId) => get().update(fileId, (workspace) => ({
    ...workspace, tabs: workspace.tabs.includes(documentId) ? workspace.tabs : [...workspace.tabs, documentId], activeId: documentId,
  })),
  closeTab: (fileId, documentId) => get().update(fileId, (workspace) => {
    const tabs = workspace.tabs.filter((id) => id !== documentId);
    return { ...workspace, tabs, activeId: workspace.activeId === documentId ? tabs.at(-1) ?? null : workspace.activeId };
  }),
  setSearch: (fileId, search) => get().update(fileId, (workspace) => ({ ...workspace, search: { ...workspace.search, ...search } })),
  setMode: (fileId, mode) => get().update(fileId, (workspace) => ({ ...workspace, mode })),
  addNode: (fileId) => {
    const workspace = get().workspaces[fileId];
    if (!workspace) return;
    const names = new Set([...evaluateDraft(workspace, getEditableFile(fileId)?.content ?? workspace.base).nodesByDocument.values()].map((node) => node.name));
    let name = "New node";
    let suffix = 2;
    while (names.has(name)) name = `New node ${suffix++}`;
    const node = createStoryNode(name);
    const file = getEditableFile(fileId);
    const project = file ? getProject(file.projectId) : null;
    node.metadata = Object.fromEntries(project?.metadataConfig.config.map((field) => [field.name, field.type === "number" ? 0 : false]) ?? []);
    const id = crypto.randomUUID();
    get().update(fileId, (current) => ({
      ...current, documents: [...current.documents, { id, originalName: null, lastName: node.name, text: serializeNode(node) }], tabs: [...current.tabs, id], activeId: id,
    }), true);
  },
  deleteNode: (fileId, documentId) => get().update(fileId, (workspace) => ({
    ...workspace, documents: workspace.documents.map((document) => document.id === documentId ? { ...document, deleted: !document.deleted } : document),
  }), true),
  resolve: (fileId, conflictId, resolution) => get().update(fileId, (workspace) => ({ ...workspace, resolutions: { ...workspace.resolutions, [conflictId]: resolution } }), true),
  reset: (fileId, story) => get().update(fileId, (workspace) => {
    const next = createWorkspace(fileId, story);
    const previousNames = workspace.documents.filter((document) => workspace.tabs.includes(document.id)).map((document) => {
      try { return (JSON.parse(document.text) as { name: string }).name; } catch { return document.originalName; }
    });
    const activeDocument = workspace.documents.find((document) => document.id === workspace.activeId);
    let activeName = activeDocument?.originalName;
    try { if (activeDocument) activeName = (JSON.parse(activeDocument.text) as { name: string }).name; } catch { /* Retain the original selection for an invalid discarded draft. */ }
    next.tabs = next.documents.filter((document) => previousNames.includes(document.originalName)).map((document) => document.id);
    next.activeId = next.documents.find((document) => document.originalName === activeName)?.id ?? next.tabs[0] ?? null;
    next.mode = workspace.mode;
    next.search = workspace.search;
    return next;
  }),
  refreshPreview: (fileId) => get().update(fileId, (workspace) => workspace, true),
}));
