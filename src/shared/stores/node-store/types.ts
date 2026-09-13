import type { StoryNode } from "@/shared/types";

export interface GraphPreview {
  nodeName: string;
  edgeId?: string;
}

export interface NodeState {
  node: StoryNode | null;
  isNew: boolean;
  startDraft: (node: StoryNode) => void;
  previewNodeName: string | null;
  previewEdgeId: string | null;
  setNode: (newNode: StoryNode | null) => void;
  setGraphPreview: (preview: GraphPreview | null) => void;
  setPreviewNodeName: (nodeName: string | null) => void;
}
