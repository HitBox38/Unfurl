import type { IdeWorkspace, StorySearch } from "@/features/story-ide/types";
import type { WorkspaceView } from "@/features/story-ide/hooks/use-story-ide-store/types";
import { isRecord } from "@/shared/lib/story-validation";
import { workspaceViewKey } from "@/shared/lib/story-ide-storage";

const isStorySearch = (value: unknown): value is StorySearch =>
  isRecord(value) &&
  typeof value.query === "string" &&
  typeof value.field === "string" &&
  typeof value.exact === "boolean" &&
  typeof value.caseSensitive === "boolean" &&
  typeof value.scope === "string" &&
  ["all", "name", "content", "choices", "destination", "metadata"].includes(
    value.scope,
  );

const isWorkspaceView = (value: unknown): value is WorkspaceView =>
  isRecord(value) &&
  value.version === 1 &&
  (value.mode === "graph" || value.mode === "ide") &&
  isStorySearch(value.search) &&
  Array.isArray(value.tabs) &&
  value.tabs.every(
    (index: unknown) =>
      typeof index === "number" && Number.isInteger(index) && index >= 0,
  ) &&
  typeof value.activeIndex === "number" &&
  Number.isInteger(value.activeIndex) &&
  value.activeIndex >= -1;

export const recoverView = (workspace: IdeWorkspace) => {
  try {
    const raw = localStorage.getItem(workspaceViewKey(workspace.fileId));
    if (!raw) return workspace;
    const view: unknown = JSON.parse(raw);
    if (!isWorkspaceView(view)) return workspace;
    const tabs = view.tabs.flatMap((index) =>
      workspace.documents[index] ? [workspace.documents[index].id] : [],
    );
    const activeId = workspace.documents[view.activeIndex]?.id;
    return {
      ...workspace,
      mode: view.mode,
      search: view.search,
      tabs,
      activeId:
        activeId && tabs.includes(activeId) ? activeId : (tabs[0] ?? null),
    };
  } catch {
    return workspace;
  }
};
