import type {
  NodeDocument,
  SearchMatch,
  StorySearch as SearchState,
} from "@/features/story-ide/types";

export interface StorySearchProps {
  documents: NodeDocument[];
  search: SearchState;
  onSearch: (search: Partial<SearchState>) => void;
  onSelect: (match: SearchMatch) => void;
  onReplace: (documents: NodeDocument[]) => void;
}
