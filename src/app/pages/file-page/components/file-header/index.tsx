import { Code2, GitBranch } from "lucide-react";

import { GraphNodeToolbar } from "@/features/graph-node-toolbar";
import { DownloadButton } from "@/features/download";
import { FileHistoryControls } from "@/features/file-history";
import { InlineNameInput } from "@/shared/components";
import { TabsList, TabsTrigger } from "@/shared/ui/tabs";
import type { FilePageController } from "@/app/pages/file-page/hooks/use-file-page";

export const FileHeader = ({ page }: { page: FilePageController }) => {
  const { name, setFileName, mode, pending } = page;
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
        <TabsList
          className="workspace-bubble workspace-toolbar h-auto min-h-10 rounded-2xl bg-card/95 group-data-horizontal/tabs:h-auto"
          aria-label="Story view"
        >
          <TabsTrigger
            value="graph"
            className="h-8 flex-none rounded-xl px-3 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
          >
            <GitBranch className="size-4" aria-hidden="true" />
            Graph
          </TabsTrigger>
          <TabsTrigger
            value="ide"
            className="h-8 flex-none rounded-xl px-3 data-[state=active]:bg-secondary data-[state=active]:text-secondary-foreground"
          >
            <Code2 className="size-4" aria-hidden="true" />
            IDE
          </TabsTrigger>
        </TabsList>
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
