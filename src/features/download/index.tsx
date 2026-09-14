import { Download } from "lucide-react";

import { downloadStoryAsJson } from "@/shared/lib/download-story-json";
import { useJsonDataStore } from "@/shared/stores";
import { Button } from "@/shared/ui/button";

export const DownloadButton = () => {
  const content = useJsonDataStore((state) => state.content);
  const name = useJsonDataStore((state) => state.name);

  return (
    <Button
      variant="outline"
      size="sm"
      className="h-10 gap-2 rounded-2xl border-border/70 bg-card/95 px-4 shadow-sm dark:bg-card/95"
      aria-label="Export JSON"
      onClick={() => downloadStoryAsJson(name, content)}
    >
      <Download className="size-4" aria-hidden="true" />
      Export JSON
    </Button>
  );
};
