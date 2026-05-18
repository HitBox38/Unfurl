import { Link } from "@tanstack/react-router";
import { FileText, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  EDITABLE_FILES_STORAGE_KEY,
  searchEditableFiles,
  type EditableFileRecord,
} from "@/features/recent-files";
import { STORAGE_EVENT } from "@/shared/hooks";
import { Input } from "@/shared/ui/input";

const formatUpdatedAt = (updatedAt: number) =>
  new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(updatedAt));

export const RecentFilesSidebar = () => {
  const [query, setQuery] = useState("");
  const [files, setFiles] = useState<EditableFileRecord[]>(() =>
    searchEditableFiles(""),
  );

  const refreshFiles = useCallback(() => {
    setFiles(searchEditableFiles(query));
  }, [query]);

  useEffect(() => {
    refreshFiles();
  }, [refreshFiles]);

  useEffect(() => {
    const onStorageChange = (
      event: CustomEvent<{ key: string; newValue: EditableFileRecord[] }>,
    ) => {
      if (event.detail.key === EDITABLE_FILES_STORAGE_KEY) {
        setFiles(
          query.trim()
            ? searchEditableFiles(query)
            : [...event.detail.newValue].sort(
                (a, b) => b.updatedAt - a.updatedAt,
              ),
        );
      }
    };
    const onNativeStorage = (event: StorageEvent) => {
      if (event.key === EDITABLE_FILES_STORAGE_KEY) {
        refreshFiles();
      }
    };

    window.addEventListener(STORAGE_EVENT, onStorageChange as EventListener);
    window.addEventListener("storage", onNativeStorage);
    return () => {
      window.removeEventListener(STORAGE_EVENT, onStorageChange as EventListener);
      window.removeEventListener("storage", onNativeStorage);
    };
  }, [query, refreshFiles]);

  return (
    <aside className="flex min-h-screen w-72 shrink-0 flex-col gap-4 border-r bg-card/70 p-4 text-left">
      <div>
        <h2 className="text-lg font-semibold">Editable files</h2>
        <p className="text-sm text-muted-foreground">
          Browse files saved on this device.
        </p>
      </div>
      <label className="relative block">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          aria-label="Search editable files"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search files"
          className="pl-9"
        />
      </label>
      <nav aria-label="Editable files" className="flex flex-1 flex-col gap-2">
        {files.length > 0 ? (
          files.map((file) => (
            <RecentFileLink key={file.id} file={file} />
          ))
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            {query.trim()
              ? "No editable files match your search."
              : "Uploaded files will appear here."}
          </p>
        )}
      </nav>
    </aside>
  );
};

const RecentFileLink = ({ file }: { file: EditableFileRecord }) => (
  <Link
    to="/files/$fileId"
    params={{ fileId: file.id }}
    className="rounded-lg border bg-background/60 p-3 text-left transition-colors hover:bg-accent"
    activeProps={{
      className: "border-primary bg-primary/20",
    }}
  >
    <span className="flex items-start gap-2">
      <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
      <span className="min-w-0">
        <span className="block truncate font-medium">{file.name}</span>
        {file.content.title ? (
          <span className="block truncate text-xs text-muted-foreground">
            {file.content.title}
          </span>
        ) : null}
        <span className="mt-1 block text-xs uppercase tracking-wide text-muted-foreground">
          {file.fileType} - {formatUpdatedAt(file.updatedAt)}
        </span>
      </span>
    </span>
  </Link>
);
