import { useMemo, useState } from "react";
import { Search, Replace } from "lucide-react";

import { displayPath, previewReplacement, searchDocuments } from "@/features/story-ide/search";
import type { NodeDocument, SearchMatch, StorySearch as SearchState } from "@/features/story-ide/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Checkbox } from "@/shared/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";

interface StorySearchProps {
  documents: NodeDocument[];
  search: SearchState;
  onSearch: (search: Partial<SearchState>) => void;
  onSelect: (match: SearchMatch) => void;
  onReplace: (documents: NodeDocument[]) => void;
}

export const StorySearch = ({ documents, search, onSearch, onSelect, onReplace }: StorySearchProps) => {
  const [replacement, setReplacement] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [limit, setLimit] = useState(100);
  const matches = useMemo(() => searchDocuments(documents, search), [documents, search]);
  const preview = useMemo(() => previewReplacement(documents, search, matches, replacement), [documents, search, matches, replacement]);
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="space-y-3 border-b p-3">
        <div className="relative"><Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" /><Input className="pl-8" aria-label="Search story data" placeholder="Search story data…" value={search.query} onChange={(event) => onSearch({ query: event.target.value })} /></div>
        <label className="block space-y-1 text-xs text-muted-foreground">Search in
          <Select value={search.scope} onValueChange={(scope) => onSearch({ scope: scope as SearchState["scope"] })}>
            <SelectTrigger className="w-full" aria-label="Search scope"><SelectValue /></SelectTrigger>
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
        {search.scope === "metadata" ? <Input aria-label="Metadata field filter" placeholder="Field name (optional)" value={search.field} onChange={(event) => onSearch({ field: event.target.value })} /> : null}
        <div className="flex flex-wrap gap-3 text-xs">
          <Label className="flex items-center gap-2 text-xs"><Checkbox checked={search.exact} onCheckedChange={(checked) => onSearch({ exact: checked === true })} />Exact value</Label>
          <Label className="flex items-center gap-2 text-xs"><Checkbox checked={search.caseSensitive} onCheckedChange={(checked) => onSearch({ caseSensitive: checked === true })} />Match case</Label>
        </div>
        <div className="flex gap-1.5"><Input aria-label="Replacement value" placeholder="Replace with…" value={replacement} onChange={(event) => setReplacement(event.target.value)} /><Button size="icon" variant="outline" aria-label="Preview replacements" title="Preview replacements" disabled={!matches.length} onClick={() => setPreviewOpen(true)}><Replace className="size-4" /></Button></div>
      </div>
      <p role="status" className="px-3 py-2 text-xs text-muted-foreground">{matches.length} matches · {new Set(matches.map((match) => match.documentId)).size} nodes</p>
      <div className="min-h-0 flex-1 overflow-auto px-2 pb-2">
        {matches.slice(0, limit).map((match, index) => (
          <Button key={`${match.documentId}:${match.from}:${index}`} variant="ghost" className="mb-1 h-auto w-full flex-col items-start gap-1 px-2 py-2 text-left" onClick={() => onSelect(match)}>
            <span className="max-w-full truncate font-mono text-xs font-medium">{match.nodeName}</span>
            <span className="max-w-full truncate text-[11px] text-muted-foreground">{displayPath(match.path)}{match.key ? " · field name" : ""}</span>
            <span className="max-w-full truncate font-mono text-xs text-foreground">{String(match.value)}</span>
          </Button>
        ))}
        {matches.length > limit ? <Button variant="outline" size="sm" className="w-full" onClick={() => setLimit(limit + 100)}>Show more matches</Button> : null}
        {!matches.length ? <p className="px-1 py-4 text-xs leading-relaxed text-muted-foreground">Find a field, a value, a destination, or text. Metadata filters can match a field across the story.</p> : null}
      </div>
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex max-h-[80svh] flex-col sm:max-w-3xl">
          <DialogHeader><DialogTitle>Preview replacements</DialogTitle><DialogDescription>{preview.changes.length} field changes across {new Set(preview.changes.map((change) => change.match.documentId)).size} nodes. Replacements join your pending fix.</DialogDescription></DialogHeader>
          <div className="min-h-0 space-y-3 overflow-auto text-left">
            {preview.errors.map((error) => <p key={error} role="alert" className="text-sm text-destructive">{error}</p>)}
            {preview.changes.map((change, index) => <div key={index} className="rounded-lg border p-3 text-sm"><p className="mb-1 text-xs text-muted-foreground">{change.match.nodeName} · {displayPath(change.match.path)}</p><p className="break-all font-mono"><span className="text-muted-foreground">{String(change.match.value)}</span> → {String(change.next)}</p></div>)}
            {!preview.changes.length && !preview.errors.length ? <p className="text-sm text-muted-foreground">No values would change.</p> : null}
          </div>
          <DialogFooter><Button variant="secondary" onClick={() => setPreviewOpen(false)}>Cancel</Button><Button disabled={!preview.changes.length || preview.errors.length > 0} onClick={() => { onReplace(preview.documents); setPreviewOpen(false); }}>Stage replacements</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
