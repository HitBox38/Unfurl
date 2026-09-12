import { useState } from "react";
import { Search, X } from "lucide-react";
import type { StoryNode } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";

interface NodeSearchProps {
  nodes: StoryNode[];
  onSelect: (node: StoryNode) => void;
}

export const NodeSearch = ({ nodes, onSelect }: NodeSearchProps) => {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const needle = query.trim().toLowerCase();
  const rank = (node: StoryNode) => {
    const name = node.name.toLowerCase();
    return name === needle
      ? 0
      : name.startsWith(needle)
        ? 1
        : name.includes(needle)
          ? 2
          : 3;
  };
  const matches = nodes
    .filter((node) =>
      [node.name, ...node.content].join(" ").toLowerCase().includes(needle),
    )
    .sort((a, b) => rank(a) - rank(b));
  return (
    <div
      className="absolute left-3 top-3 z-10 w-[min(20rem,calc(100%-1.5rem))] rounded-lg border bg-card shadow-md"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setOpen(false);
          event.stopPropagation();
        }
      }}
    >
      <div className="flex items-center gap-2 p-2">
        <Search
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          aria-label="Find a node"
          placeholder="Find a node or story text…"
          value={query}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" && matches[0]) {
              event.preventDefault();
              onSelect(matches[0]);
              setOpen(false);
            }
          }}
          aria-expanded={open}
          aria-controls="node-search-results"
        />
        {query ? (
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Clear node search"
            onClick={() => setQuery("")}
          >
            <X />
          </Button>
        ) : null}
      </div>
      {open ? (
        <div
          id="node-search-results"
          className="max-h-64 overflow-y-auto border-t p-2"
        >
          <p role="status" className="px-2 py-1 text-xs text-muted-foreground">
            {matches.length} matching nodes
          </p>
          {matches.map((node) => (
            <Button
              key={node.name}
              variant="ghost"
              className="h-auto w-full justify-start whitespace-normal py-2 text-left"
              onClick={() => {
                onSelect(node);
                setOpen(false);
              }}
            >
              {node.name}
            </Button>
          ))}
        </div>
      ) : null}
    </div>
  );
};
