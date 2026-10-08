import { X } from "lucide-react";

import { Button } from "@/shared/ui/button";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const IdeMessages = ({ ide }: { ide: StoryIdeController }) => {
  const { storageError, error, notice, setNotice } = ide;
  return (
    <>
      {storageError || error ? (
        <p
          role="alert"
          className="shrink-0 border-b bg-destructive/10 px-4 py-2 text-sm text-destructive"
        >
          {storageError ?? error}
        </p>
      ) : null}
      {notice ? (
        <p
          role="status"
          className="flex shrink-0 items-center justify-between gap-2 border-b bg-muted/50 px-4 py-2 text-xs text-muted-foreground"
        >
          {notice}
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Dismiss IDE message"
            onClick={() => setNotice(null)}
          >
            <X className="size-3" />
          </Button>
        </p>
      ) : null}
    </>
  );
};
