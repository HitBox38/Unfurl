import { seedMetadataDefaults } from "@/shared/lib/convertors";
import type {
  MetadataConfigTemplate,
  StoryData,
  StoryNode,
  SupportedFileType,
} from "@/shared/types";

import { SUPPORTED_EXTENSIONS } from "./constants";

export const fileExtension = (fileName: string) => {
  const dot = fileName.lastIndexOf(".");
  return dot === -1 ? "" : fileName.slice(dot + 1).toLowerCase();
};

export const stripFileExtension = (fileName: string) => {
  const dot = fileName.lastIndexOf(".");
  return dot <= 0 ? fileName : fileName.slice(0, dot);
};

export const toSupportedFileType = (
  fileName: string,
): SupportedFileType | null => {
  const extension = fileExtension(fileName);
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(extension)
    ? (extension as SupportedFileType)
    : null;
};

export interface PartitionedFiles {
  /** `.twee` and `.json`: each one becomes its own record. */
  stories: File[];
  /** `.md`: all notes of one drop merge into a single story. */
  markdown: File[];
  skipped: string[];
}

export const partitionFiles = (files: File[]): PartitionedFiles => {
  const partition: PartitionedFiles = { stories: [], markdown: [], skipped: [] };
  for (const file of files) {
    const type = toSupportedFileType(file.name);
    if (type === null) {
      partition.skipped.push(file.name);
    } else if (type === "md") {
      partition.markdown.push(file);
    } else {
      partition.stories.push(file);
    }
  }
  return partition;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isStoryNode = (value: unknown): value is StoryNode =>
  isRecord(value) &&
  typeof value.name === "string" &&
  Array.isArray(value.content) &&
  Array.isArray(value.choices) &&
  isRecord(value.metadata);

/** Structural guard for user-supplied JSON before it is trusted as a story. */
export const isStoryData = (value: unknown): value is StoryData =>
  isRecord(value) &&
  (value.title === null || typeof value.title === "string" || value.title === undefined) &&
  (value.start === null || typeof value.start === "string" || value.start === undefined) &&
  Array.isArray(value.nodes) &&
  value.nodes.every(isStoryNode);

/** Adds zero-valued entries for configured fields a node does not carry yet. */
export const backfillMetadata = (
  story: StoryData,
  config: MetadataConfigTemplate,
): StoryData => ({
  ...story,
  title: story.title ?? null,
  start: story.start ?? null,
  nodes: story.nodes.map((node) => ({
    ...node,
    metadata: { ...seedMetadataDefaults(config), ...node.metadata },
  })),
});
