import type { StoryNode } from "@/shared/types";

export interface DialogNodeData extends Record<string, unknown> {
  highlight?: "selected" | "preview" | "connected";
  label: string;
  metadata: StoryNode;
}

export interface DialogViewerUiState {
  isDeleteMode: boolean;
  toggleDeleteMode: () => void;
  setDeleteMode: (enabled: boolean) => void;
  reset: () => void;
}
