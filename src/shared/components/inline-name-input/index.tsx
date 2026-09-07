import { useState } from "react";

import { cn } from "@/shared/lib/cn";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

interface InlineNameInputProps {
  id: string;
  /** Accessible name; rendered as a visually hidden label. */
  label: string;
  name: string;
  onCommit: (name: string) => void;
  fallbackName?: string;
  className?: string;
}

/**
 * Borderless text field that looks like a heading and commits on blur or
 * Enter. Blank input reverts to the previous name instead of committing.
 * Remount (via `key`) when `name` changes from outside to reset the draft.
 */
export const InlineNameInput = ({
  id,
  label,
  name,
  onCommit,
  fallbackName = "Untitled",
  className,
}: InlineNameInputProps) => {
  const displayName = name || fallbackName;
  const [draftName, setDraftName] = useState(displayName);

  const commitName = (value: string) => {
    const nextName = value.trim();
    if (!nextName) {
      setDraftName(displayName);
      return;
    }

    if (nextName !== name) {
      onCommit(nextName);
    }
    setDraftName(nextName);
  };

  return (
    <div className="min-w-0 flex-1 text-left">
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
      <Input
        id={id}
        aria-label={label}
        value={draftName}
        onChange={(event) => setDraftName(event.target.value)}
        onBlur={(event) => commitName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        className={cn(
          "h-auto w-full truncate rounded-full border border-transparent bg-transparent px-2 py-0 font-bold leading-tight shadow-none ring-0 hover:border-input hover:bg-background/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-transparent",
          className,
        )}
      />
    </div>
  );
};
