import { useJsonNodeEditor } from "@/features/story-ide/components/json-node-editor/hooks/use-json-node-editor";
import type { JsonNodeEditorProps } from "@/features/story-ide/components/json-node-editor/types";

export const JsonNodeEditor = (props: JsonNodeEditorProps) => {
  const parentRef = useJsonNodeEditor(props);
  return (
    <div ref={parentRef} className="ide-code-editor h-full min-h-0 min-w-0" />
  );
};
