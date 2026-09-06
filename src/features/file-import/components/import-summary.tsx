import { X } from "lucide-react";

import { Button } from "@/shared/ui/button";

import type { ImportFilesResult } from "../types";

interface ImportSummaryProps {
  result: ImportFilesResult;
  onDismiss: () => void;
}

export const ImportSummary = ({ result, onDismiss }: ImportSummaryProps) => {
  const { imported, failed, skipped } = result;

  return (
    <div
      role="status"
      className="flex flex-col gap-2 rounded-xl bg-card p-3 text-sm ring-1 ring-foreground/10"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="font-medium">
          Imported {imported.length} of {imported.length + failed.length}{" "}
          {imported.length + failed.length === 1 ? "file" : "files"}
          {skipped.length > 0
            ? `, skipped ${skipped.length} unsupported`
            : ""}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label="Dismiss import summary"
          onClick={onDismiss}
        >
          <X aria-hidden="true" />
        </Button>
      </div>
      {imported.length > 0 ? (
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
          {imported.map((file) => (
            <li key={file.id}>{file.name}</li>
          ))}
        </ul>
      ) : null}
      {failed.length > 0 ? (
        <ul className="flex flex-col gap-1">
          {failed.map((failure) => (
            <li key={failure.fileName} className="flex flex-wrap gap-x-1.5">
              <span className="font-medium">{failure.fileName}</span>
              <span className="text-destructive">{failure.reason}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {skipped.length > 0 ? (
        <ul className="flex flex-col gap-1 text-muted-foreground">
          {skipped.map((fileName) => (
            <li key={fileName} className="flex flex-wrap gap-x-1.5">
              <span>{fileName}</span>
              <span>unsupported file type</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};
