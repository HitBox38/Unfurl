import type { MetadataField } from "@/shared/types/metadata-config-template";
import type {
  EditorLocation,
  IdeIssue,
  NodeDocument,
} from "@/features/story-ide/types";

export interface JsonNodeEditorProps {
  document: NodeDocument;
  nodeNames: string[];
  fields: MetadataField[];
  issues: IdeIssue[];
  location: EditorLocation | null;
  onChange: (text: string) => void;
}
