import { Files, Plus, Search } from "lucide-react";

import { Button } from "@/shared/ui/button";
import { IdeGraphWindow } from "@/features/story-ide/components/ide-graph-window";
import { StorySearch } from "@/features/story-ide/components/story-search";
import { NodeExplorer } from "@/features/story-ide/components/node-explorer";
import { stageDocuments } from "@/features/story-ide/draft";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const IdeSidebar = ({ ide }: { ide: StoryIdeController }) => {
  const { sidebar, setSidebar, actions, fileId, workspace, select, setNotice } =
    ide;
  return (
    <aside
      className="ide-sidebar flex min-h-0 flex-col border-r bg-muted/15"
      aria-label="Story investigation"
    >
      <div className="flex shrink-0 items-center gap-1 border-b p-2">
        <Button
          size="sm"
          variant={sidebar === "nodes" ? "secondary" : "ghost"}
          aria-pressed={sidebar === "nodes"}
          onClick={() => setSidebar("nodes")}
        >
          <Files className="size-4" />
          Nodes
        </Button>
        <Button
          size="sm"
          variant={sidebar === "search" ? "secondary" : "ghost"}
          aria-pressed={sidebar === "search"}
          onClick={() => setSidebar("search")}
        >
          <Search className="size-4" />
          Search
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          className="ml-auto"
          aria-label="Add draft node"
          title="Add draft node"
          onClick={() => actions.addNode(fileId)}
        >
          <Plus className="size-4" />
        </Button>
      </div>
      {sidebar === "nodes" ? (
        <NodeExplorer ide={ide} />
      ) : (
        <StorySearch
          documents={workspace.documents}
          search={workspace.search}
          onSearch={(search) => actions.setSearch(fileId, search)}
          onSelect={(match) => select(match.documentId, match.path, match.key)}
          onReplace={(documents) => {
            actions.update(
              fileId,
              (current) => stageDocuments(current, documents),
              true,
            );
            setNotice(
              "Replacements staged. Review the complete fix before applying.",
            );
          }}
        />
      )}
      <IdeGraphWindow ide={ide} />
    </aside>
  );
};
