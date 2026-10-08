import type { StorySearch as SearchState } from "@/features/story-ide/types";
import type { StorySearchProps } from "@/features/story-ide/components/story-search/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

export const SearchScope = ({
  search,
  onSearch,
}: Pick<StorySearchProps, "search" | "onSearch">) => (
  <label className="block space-y-1 text-xs text-muted-foreground">
    Search in
    <Select
      value={search.scope}
      onValueChange={(scope) =>
        onSearch({ scope: scope as SearchState["scope"] })
      }
    >
      <SelectTrigger className="w-full" aria-label="Search scope">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All fields and text</SelectItem>
        <SelectItem value="name">Node names</SelectItem>
        <SelectItem value="content">Narrative content</SelectItem>
        <SelectItem value="choices">Choices</SelectItem>
        <SelectItem value="destination">Destinations</SelectItem>
        <SelectItem value="metadata">Metadata values</SelectItem>
      </SelectContent>
    </Select>
  </label>
);
