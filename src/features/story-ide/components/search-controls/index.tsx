import { Search, Replace } from "lucide-react";

import type { StorySearchProps } from "@/features/story-ide/components/story-search/types";
import { SearchScope } from "@/features/story-ide/components/search-scope";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";

interface SearchControlsProps
  extends Pick<StorySearchProps, "search" | "onSearch"> {
  replacement: string;
  setReplacement: (value: string) => void;
  canReplace: boolean;
  onPreview: () => void;
}
export const SearchControls = ({
  search,
  onSearch,
  replacement,
  setReplacement,
  canReplace,
  onPreview,
}: SearchControlsProps) => (
  <div className="space-y-3 border-b p-3">
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
      <Input
        className="pl-8"
        aria-label="Search story data"
        placeholder="Search story data…"
        value={search.query}
        onChange={(event) => onSearch({ query: event.target.value })}
      />
    </div>
    <SearchScope search={search} onSearch={onSearch} />
    {search.scope === "metadata" ? (
      <Input
        aria-label="Metadata field filter"
        placeholder="Field name (optional)"
        value={search.field}
        onChange={(event) => onSearch({ field: event.target.value })}
      />
    ) : null}
    <div className="flex flex-wrap gap-3 text-xs">
      <Label className="flex items-center gap-2 text-xs">
        <Checkbox
          checked={search.exact}
          onCheckedChange={(checked) => onSearch({ exact: checked === true })}
        />
        Exact value
      </Label>
      <Label className="flex items-center gap-2 text-xs">
        <Checkbox
          checked={search.caseSensitive}
          onCheckedChange={(checked) =>
            onSearch({ caseSensitive: checked === true })
          }
        />
        Match case
      </Label>
    </div>
    <div className="flex gap-1.5">
      <Input
        aria-label="Replacement value"
        placeholder="Replace with…"
        value={replacement}
        onChange={(event) => setReplacement(event.target.value)}
      />
      <Button
        size="icon"
        variant="outline"
        aria-label="Preview replacements"
        title="Preview replacements"
        disabled={!canReplace}
        onClick={onPreview}
      >
        <Replace className="size-4" />
      </Button>
    </div>
  </div>
);
