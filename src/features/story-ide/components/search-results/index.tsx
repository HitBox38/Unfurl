import type { SearchMatch } from "@/features/story-ide/types";
import { displayPath } from "@/features/story-ide/search";
import { Button } from "@/shared/ui/button";

interface SearchResultsProps {
  matches: SearchMatch[];
  limit: number;
  onSelect: (match: SearchMatch) => void;
  onShowMore: () => void;
}
export const SearchResults = ({
  matches,
  limit,
  onSelect,
  onShowMore,
}: SearchResultsProps) => (
  <>
    {" "}
    <p role="status" className="px-3 py-2 text-xs text-muted-foreground">
      {matches.length} matches ·{" "}
      {new Set(matches.map((match) => match.documentId)).size} nodes
    </p>
    <div className="min-h-0 flex-1 overflow-auto px-2 pb-2">
      {matches.slice(0, limit).map((match, index) => (
        <Button
          key={`${match.documentId}:${match.from}:${index}`}
          variant="ghost"
          className="mb-1 h-auto w-full flex-col items-start gap-1 px-2 py-2 text-left"
          onClick={() => onSelect(match)}
        >
          <span className="max-w-full truncate font-mono text-xs font-medium">
            {match.nodeName}
          </span>
          <span className="max-w-full truncate text-[11px] text-muted-foreground">
            {displayPath(match.path)}
            {match.key ? " · field name" : ""}
          </span>
          <span className="max-w-full truncate font-mono text-xs text-foreground">
            {String(match.value)}
          </span>
        </Button>
      ))}
      {matches.length > limit ? (
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={onShowMore}
        >
          Show more matches
        </Button>
      ) : null}
      {!matches.length ? (
        <p className="px-1 py-4 text-xs leading-relaxed text-muted-foreground">
          Find a field, a value, a destination, or text. Metadata filters can
          match a field across the story.
        </p>
      ) : null}
    </div>
  </>
);
