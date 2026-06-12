import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";

const updatedAtFormatter = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export const formatUpdatedAt = (updatedAt: number) =>
  updatedAtFormatter.format(new Date(updatedAt));

export const sortFilesNewestFirst = (files: EditableFileRecord[]) =>
  Array.from(files).sort((a, b) => b.updatedAt - a.updatedAt);
