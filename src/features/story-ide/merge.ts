import { isRecord, type StoryPath } from "@/shared/lib/story-validation";

import type { MergeConflict } from "./types";

export const valuesEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) && Array.isArray(right)) {
    return left.length === right.length && left.every((value, index) => valuesEqual(value, right[index]));
  }
  if (isRecord(left) && isRecord(right)) {
    const keys = Object.keys(left);
    return keys.length === Object.keys(right).length && keys.every((key) => Object.hasOwn(right, key) && valuesEqual(left[key], right[key]));
  }
  return false;
};

interface MergeContext {
  documentId: string | null;
  nodeName: string;
  conflicts: MergeConflict[];
  resolutions: Record<string, "saved" | "draft">;
}

export const mergeValues = (
  original: unknown,
  saved: unknown,
  draft: unknown,
  context: MergeContext,
  path: StoryPath = [],
): unknown => {
  if (valuesEqual(draft, original)) return saved;
  if (valuesEqual(saved, original) || valuesEqual(saved, draft)) return draft;
  if (isRecord(original) && isRecord(saved) && isRecord(draft)) {
    return Object.fromEntries(
      [...new Set([...Object.keys(original), ...Object.keys(saved), ...Object.keys(draft)])]
        .map((key) => [key, mergeValues(original[key], saved[key], draft[key], context, [...path, key])])
        .filter(([, value]) => value !== undefined),
    );
  }
  const id = JSON.stringify([context.documentId, path, original, saved, draft]);
  const resolution = context.resolutions[id];
  if (resolution) return resolution === "saved" ? saved : draft;
  context.conflicts.push({ id, documentId: context.documentId, nodeName: context.nodeName, path, original, saved, draft });
  return draft;
};
