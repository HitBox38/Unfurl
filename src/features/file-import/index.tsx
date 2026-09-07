import { FileText, Loader2, Upload, X } from "lucide-react";
import {
  useCallback,
  useId,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type RefObject,
} from "react";

import { useProject } from "@/shared/hooks";
import { cn } from "@/shared/lib/cn";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { ImportSummary } from "./components/import-summary";
import { PageDropOverlay } from "./components/page-drop-overlay";
import { FILE_INPUT_ACCEPT } from "./constants";
import { partitionFiles, toSupportedFileType } from "./helpers";
import { useImportFiles } from "./hooks/use-import-files";
import { usePageDropTarget } from "./hooks/use-page-drop-target";
import type { ImportFilesResult } from "./types";

export type {
  ImportFailure,
  ImportFilesInput,
  ImportFilesResult,
} from "./types";

interface FileImportDropzoneProps {
  projectId: string;
  className?: string;
  /**
   * When set, the whole element becomes a drop target too (with an overlay
   * while dragging) and its drops run through the same staging logic.
   * The element must be `position: relative`.
   */
  pageDropTargetRef?: RefObject<HTMLElement | null>;
}

const EMPTY_CONFIG = { config: [] };

const pluralize = (count: number, noun: string) =>
  `${count} ${noun}${count === 1 ? "" : "s"}`;

const mergeNotes = (current: File[], incoming: File[]) => {
  const seen = new Set(current.map((file) => file.name));
  return [...current, ...incoming.filter((file) => !seen.has(file.name))];
};

/**
 * Drag-and-drop + picker entry point for importing story files into one
 * project. `.twee`/`.json` import on drop; `.md` notes are staged until the
 * user names the story they combine into.
 */
export const FileImportDropzone = ({
  projectId,
  className,
  pageDropTargetRef,
}: FileImportDropzoneProps) => {
  const project = useProject(projectId);
  const { importFiles, isImporting } = useImportFiles();
  const [isDragging, setIsDragging] = useState(false);
  const [stagedNotes, setStagedNotes] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState<ImportFilesResult | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const metadataConfig = project?.metadataConfig ?? EMPTY_CONFIG;
  const hasStagedNotes = stagedNotes.length > 0;

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      const { markdown } = partitionFiles(files);
      const immediate = files.filter(
        (file) => toSupportedFileType(file.name) !== "md",
      );
      if (markdown.length > 0) {
        setStagedNotes((current) => mergeNotes(current, markdown));
      }
      if (immediate.length > 0) {
        const result = await importFiles(
          { files: immediate, projectId, metadataConfig },
          { stay: markdown.length > 0 || hasStagedNotes },
        );
        setSummary(result);
      }
    },
    [hasStagedNotes, importFiles, metadataConfig, projectId],
  );

  const pageDragTarget = usePageDropTarget({
    targetRef: pageDropTargetRef,
    ignoreWithin: zoneRef,
    onDrop: handleFiles,
  });

  const importStagedNotes = async () => {
    const result = await importFiles({
      files: stagedNotes,
      projectId,
      metadataConfig,
      markdownTitle: title,
    });
    setSummary(result);
    if (result.imported.length > 0) {
      setStagedNotes([]);
      setTitle("");
    }
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    void handleFiles(Array.from(event.dataTransfer.files));
  };

  const onDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    void handleFiles(Array.from(event.target.files ?? []));
    // Reset so picking the same file again still fires `change`.
    event.target.value = "";
  };

  const canImportNotes = title.trim().length > 0 && !isImporting;

  return (
    <div className={cn("flex flex-col gap-3 text-left", className)}>
      {pageDragTarget ? (
        <PageDropOverlay
          container={pageDragTarget}
          label={`Drop to import into ${project?.name ?? "this project"}`}
        />
      ) : null}
      <div
        ref={zoneRef}
        data-testid="file-import-dropzone"
        data-dragging={isDragging || undefined}
        onDragOver={onDragOver}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={cn(
          "flex items-center gap-3 rounded-lg border border-dashed px-3 py-2 transition-colors",
          isDragging && "border-primary bg-primary/5",
        )}
      >
        <Upload
          className="size-4 shrink-0 text-muted-foreground"
          aria-hidden="true"
        />
        <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
          Drop .twee, .json or .md files here
        </p>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={isImporting}
          onClick={() => inputRef.current?.click()}
        >
          {isImporting ? (
            <Loader2 className="animate-spin" aria-hidden="true" />
          ) : null}
          Browse files
        </Button>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={FILE_INPUT_ACCEPT}
          aria-label="Browse files"
          className="sr-only"
          onChange={onPick}
        />
      </div>

      {stagedNotes.length > 0 ? (
        <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium">
              {pluralize(stagedNotes.length, "Markdown note")} will become one
              story
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setStagedNotes([])}
            >
              Clear
            </Button>
          </div>
          <ul className="flex flex-wrap gap-2">
            {stagedNotes.map((file) => (
              <li key={file.name}>
                <Badge variant="secondary" className="h-6 gap-1 pr-1">
                  <FileText aria-hidden="true" />
                  <span>{file.name}</span>
                  <button
                    type="button"
                    aria-label={`Remove ${file.name}`}
                    className="inline-flex rounded-full p-0.5 hover:bg-foreground/10"
                    onClick={() =>
                      setStagedNotes((current) =>
                        current.filter((note) => note.name !== file.name),
                      )
                    }
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </Badge>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex flex-1 flex-col gap-1.5">
              <Label htmlFor={titleId}>Story title</Label>
              <Input
                id={titleId}
                value={title}
                placeholder="What is this story called?"
                onChange={(event) => setTitle(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && canImportNotes) {
                    event.preventDefault();
                    void importStagedNotes();
                  }
                }}
              />
            </div>
            <Button
              type="button"
              disabled={!canImportNotes}
              onClick={() => void importStagedNotes()}
            >
              Import {pluralize(stagedNotes.length, "note")}
            </Button>
          </div>
        </div>
      ) : null}

      {summary ? (
        <ImportSummary result={summary} onDismiss={() => setSummary(null)} />
      ) : null}
    </div>
  );
};
