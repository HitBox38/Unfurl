import type { MetadataConfigTemplate } from "@/shared/types";

/** Structural check for data that came from storage or a user-picked file. */
export const isMetadataConfigTemplate = (
  value: unknown,
): value is MetadataConfigTemplate =>
  typeof value === "object" &&
  value !== null &&
  Array.isArray((value as { config?: unknown }).config);
