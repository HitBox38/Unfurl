export interface PreviewNode {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface PreviewEdge {
  id: string;
  path: string;
}

export interface StoryPreview {
  nodes: PreviewNode[];
  edges: PreviewEdge[];
  width: number;
  height: number;
}
