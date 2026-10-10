import { useMemo, useState } from "react";

import {
  previewReplacement,
  searchDocuments,
} from "@/features/story-ide/search";
import { SearchControls } from "@/features/story-ide/components/search-controls";
import { SearchResults } from "@/features/story-ide/components/search-results";
import { ReplacementPreview } from "@/features/story-ide/components/replacement-preview";
import type { StorySearchProps } from "@/features/story-ide/components/story-search/types";

export const StorySearch = ({
  documents,
  search,
  onSearch,
  onSelect,
  onReplace,
}: StorySearchProps) => {
  const [replacement, setReplacement] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [limit, setLimit] = useState(100);
  const matches = useMemo(
    () => searchDocuments(documents, search),
    [documents, search],
  );
  const preview = useMemo(
    () => previewReplacement(documents, search, matches, replacement),
    [documents, search, matches, replacement],
  );
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <SearchControls
        search={search}
        onSearch={onSearch}
        replacement={replacement}
        setReplacement={setReplacement}
        canReplace={matches.some((match) => !match.key)}
        onPreview={() => setPreviewOpen(true)}
      />
      <SearchResults
        matches={matches}
        limit={limit}
        onSelect={onSelect}
        onShowMore={() => setLimit(limit + 100)}
      />
      <ReplacementPreview
        preview={preview}
        previewOpen={previewOpen}
        setPreviewOpen={setPreviewOpen}
        onReplace={onReplace}
      />
    </div>
  );
};
