import { Download } from "lucide-react";

import { downloadStoryAsJson } from "@/shared/lib/download-story-json";
import { useJsonDataStore } from "@/shared/stores";
import { Button } from "@/shared/ui/button";

export const DownloadButton = () => {
  const content = useJsonDataStore((state) => state.content);
  const name = useJsonDataStore((state) => state.name);

  return (
    <Button
      variant="secondary"
      size="icon-sm"
      aria-label="Download"
      onClick={() => downloadStoryAsJson(name, content)}
    >
      <Download aria-hidden="true" />
    </Button>
  );
};
