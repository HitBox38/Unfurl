import { Activity, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";

import { NodeEditor } from "@/features/node-editor";
import { FileGraphPane } from "@/app/pages/file-page/components/file-graph-pane";
import type { FilePageController } from "@/app/pages/file-page/hooks/use-file-page";

const LazyStoryIde = lazy(() => import("@/features/story-ide"));
export const FileWorkspace = ({
  page,
  fileId,
}: {
  page: FilePageController;
  fileId: string;
}) => {
  const { hasOpenedIde, mode, node, pending, setVisualEditorDirty } = page;
  return (
    <div className="file-workspace min-h-0 flex-1">
      {hasOpenedIde || mode === "ide" ? (
        <Activity mode={mode === "ide" ? "visible" : "hidden"}>
          <div className="h-full min-h-0 px-4 pb-4">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <Loader2
                    className="animate-spin"
                    aria-label="Loading story IDE"
                  />
                </div>
              }
            >
              <LazyStoryIde key={fileId} fileId={fileId} />
            </Suspense>
          </div>
        </Activity>
      ) : null}
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
    </div>
  );
};
