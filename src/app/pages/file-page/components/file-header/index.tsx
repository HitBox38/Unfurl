import { Code2, GitBranch } from "lucide-react";

import { GraphNodeToolbar } from "@/features/graph-node-toolbar";
import { DownloadButton } from "@/features/download";
import { FileHistoryControls } from "@/features/file-history";
import { InlineNameInput } from "@/shared/components";
import { Button } from "@/shared/ui/button";
import type { FilePageController } from "@/app/pages/file-page/hooks/use-file-page";

export const FileHeader = ({ page }: { page: FilePageController }) => {
  const { name, setFileName, mode, chooseMode, pending } = page;
  return (
    <header className="file-header shrink-0 text-left">
      <div
        data-testid="file-page-header"
        className="file-title-bubble workspace-bubble flex min-h-10 min-w-0 items-center px-3 py-1"
      >
        <InlineNameInput
          key={name || "Untitled"}
          id="file-name"
          label="File name"
          name={name}
          onCommit={setFileName}
          className="text-base md:text-base"
        />
      </div>
      <div
        data-testid="file-toolbar"
        className="flex flex-wrap items-center gap-3"
      >
        <div
          className="workspace-bubble workspace-toolbar"
          role="group"
          aria-label="Story view"
        >
          <Button
            variant={mode === "graph" ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={mode === "graph"}
            onClick={() => chooseMode("graph")}
          >
            <GitBranch className="size-4" aria-hidden="true" />
            Graph
          </Button>
          <Button
            variant={mode === "ide" ? "secondary" : "ghost"}
            size="sm"
            aria-pressed={mode === "ide"}
            onClick={() => chooseMode("ide")}
          >
            <Code2 className="size-4" aria-hidden="true" />
            IDE
          </Button>
        </div>
        <div
          data-testid="file-history-bubble"
          className="workspace-bubble workspace-toolbar"
        >
          <FileHistoryControls disabled={pending} />
        </div>
        {mode === "graph" && !pending ? (
          <div
            data-testid="file-add-node-bubble"
            className="workspace-bubble workspace-toolbar"
          >
            <GraphNodeToolbar />
          </div>
        ) : null}
        <div data-testid="file-download-bubble" className="flex">
          <DownloadButton />
        </div>
      </div>
    </header>
  );
};
