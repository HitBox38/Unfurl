import { X } from "lucide-react";
import { AnimatePresence } from "motion/react";

import { Button } from "@/shared/ui/button";
import { IdeMessage } from "@/features/story-ide/components/ide-message";
import type { StoryIdeController } from "@/features/story-ide/hooks/use-story-ide-controller";

export const IdeMessages = ({ ide }: { ide: StoryIdeController }) => {
  const { storageError, error, notice, setNotice } = ide;
  return (
    <AnimatePresence initial={false}>
      {storageError || error ? (
        <IdeMessage key="error" role="alert">
          {storageError ?? error}
        </IdeMessage>
      ) : null}
      {notice ? (
        <IdeMessage key="notice" role="status">
          {notice}
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Dismiss IDE message"
            onClick={() => setNotice(null)}
          >
            <X className="size-3" />
          </Button>
        </IdeMessage>
      ) : null}
    </AnimatePresence>
  );
};
