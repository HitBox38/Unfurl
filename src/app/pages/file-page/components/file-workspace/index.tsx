import { Activity } from "react";

import { TabsContent } from "@/shared/ui/tabs";
import { NodeEditor } from "@/features/node-editor";
import { FileGraphPane } from "@/app/pages/file-page/components/file-graph-pane";
import { FileIdePane } from "@/app/pages/file-page/components/file-ide-pane";
import type { FilePageController } from "@/app/pages/file-page/hooks/use-file-page";

export const FileWorkspace = ({
  page,
  fileId,
}: {
  page: FilePageController;
  fileId: string;
}) => {
  const { hasOpenedIde, mode, node, pending, setVisualEditorDirty } = page;
  return (
    <div className="file-workspace relative min-h-0 flex-1">
      <FileIdePane active={mode === "ide"} fileId={fileId} opened={hasOpenedIde} />
      <TabsContent
        value="graph"
        forceMount
        hidden={mode !== "graph"}
        className="m-0 h-full min-h-0"
      >
        <Activity mode={mode === "graph" ? "visible" : "hidden"}>
          <div
            className={
              node && !pending
                ? "file-editor-layout has-editor"
                : "file-editor-layout"
            }
          >
            <FileGraphPane page={page} />
            {node && !pending ? (
              <aside aria-label="Node editor" className="file-node-panel">
                <NodeEditor onDirtyChange={setVisualEditorDirty} />
              </aside>
            ) : null}
          </div>
        </Activity>
      </TabsContent>
    </div>
  );
};
