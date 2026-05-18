export type SupportedFileType = "twee" | "json" | "md";

export const SUPPORTED_FILE_TYPES: readonly SupportedFileType[] = [
  "twee",
  "json",
  "md",
] as const;
