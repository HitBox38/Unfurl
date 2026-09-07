import type { SupportedFileType } from "@/shared/types";

export const SUPPORTED_EXTENSIONS: readonly SupportedFileType[] = [
  "twee",
  "json",
  "md",
];

export const FILE_INPUT_ACCEPT = SUPPORTED_EXTENSIONS.map(
  (extension) => `.${extension}`,
).join(",");

export const MARKDOWN_TITLE_REQUIRED_REASON =
  "A story title is required to import Markdown notes";

export const INVALID_JSON_REASON = "Invalid JSON";

export const NOT_A_STORY_REASON = "Not an Unfurl story (missing nodes)";
