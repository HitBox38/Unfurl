import { Loader2 } from "lucide-react";

import { useFilePage } from "@/app/pages/file-page/hooks/use-file-page";
import { MissingFile } from "@/app/pages/file-page/components/missing-file";
import { FileHeader } from "@/app/pages/file-page/components/file-header";
import { FileWorkspace } from "@/app/pages/file-page/components/file-workspace";

export const FilePage = () => {
  const page = useFilePage();
  if (page.isMissing) return <MissingFile />;
  if (!page.fileId || page.activeFileId !== page.fileId)
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center">
        <Loader2 className="animate-spin" aria-label="Loading editable file" />
      </div>
    );
  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <FileHeader page={page} />
        <FileWorkspace page={page} fileId={page.fileId} />
      </section>
    </div>
  );
};
