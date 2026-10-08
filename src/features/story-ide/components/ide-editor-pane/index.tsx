import { Code2 } from "lucide-react";

import { TabsContent } from "@/shared/ui/tabs";
import { JsonNodeEditor } from "@/features/story-ide/components/json-node-editor";
import { NodeEditorToolbar } from "@/features/story-ide/components/node-editor-toolbar";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const IdeEditorPane = ({ ide }: { ide: StoryIdeController }) => {
  const {
    activeDocument,
    result,
    saved,
    project,
    activeIssues,
    location,
    actions,
    fileId,
    setNotice,
  } = ide;
  return activeDocument ? (
    <>
      <NodeEditorToolbar ide={ide} />
      <TabsContent
        value={activeDocument.id}
        forceMount
        className="min-h-0 flex-1 overflow-hidden"
      >
        {activeDocument.deleted ? (
          <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
            This node and its incoming choices will be removed when you apply
            the fix.
          </div>
        ) : (
          <JsonNodeEditor
            document={activeDocument}
            nodeNames={
              result.story?.nodes.map((node) => node.name) ??
              saved.nodes.map((node) => node.name)
            }
            fields={project?.metadataConfig.config ?? []}
            issues={activeIssues}
            location={location}
            onChange={(text) => {
              actions.editDocument(fileId, activeDocument.id, text);
              setNotice(null);
            }}
          />
        )}
      </TabsContent>
    </>
  ) : (
    <div className="flex min-h-0 flex-1 items-center justify-center p-8">
      <div className="max-w-xs text-center">
        <Code2 className="mx-auto mb-3 size-8 text-muted-foreground" />
        <p className="text-sm font-medium">Open a node to investigate</p>
        <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
          Choose a node, select a search result, or click the graph preview.
          Closing a tab keeps its draft.
        </p>
      </div>
    </div>
  );
};
