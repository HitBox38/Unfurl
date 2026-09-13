import { useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";

import { fromMd, fromTwee } from "@/shared/lib/convertors";
import { nodeCountBucket, trackEvent } from "@/shared/lib/analytics";
import type { AnalyticsError } from "@/shared/lib/analytics/types";
import {
  saveEditableFile,
  type EditableFileRecord,
} from "@/shared/lib/editable-files-storage";
import type { StoryData } from "@/shared/types";

import {
  INVALID_JSON_REASON,
  MARKDOWN_TITLE_REQUIRED_REASON,
  NOT_A_STORY_REASON,
} from "../constants";
import {
  backfillMetadata,
  isStoryData,
  partitionFiles,
  stripFileExtension,
  toSupportedFileType,
} from "../helpers";
import type { ImportFilesInput, ImportFilesResult } from "../types";

const errorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const analyticsError = (error: unknown, saving: boolean): AnalyticsError => {
  if (saving) return "storage";
  if (error instanceof Error && error.message === INVALID_JSON_REASON)
    return "invalid_json";
  if (error instanceof Error && error.message === NOT_A_STORY_REASON)
    return "invalid_story";
  return "conversion";
};

const parseStoryJson = (text: string): StoryData => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(INVALID_JSON_REASON);
  }
  if (!isStoryData(parsed)) {
    throw new Error(NOT_A_STORY_REASON);
  }
  return parsed;
};

/**
 * Converts and persists a batch of dropped files into `projectId`. Never
 * throws for bad input: every problem is reported per file in the result so
 * the UI can show a summary and still keep the good imports.
 */
export const importFiles = async (
  input: ImportFilesInput,
): Promise<ImportFilesResult> => {
  const { files, projectId, metadataConfig } = input;
  const { stories, markdown, skipped } = partitionFiles(files);
  const result: ImportFilesResult = { imported: [], failed: [], skipped };
  const convertOptions = { config: metadataConfig };

  for (const _file of skipped) {
    trackEvent("import_failed", {
      format: "unknown",
      error_class: "unsupported_format",
    });
  }

  for (const file of stories) {
    const fileType = toSupportedFileType(file.name);
    if (fileType === null || fileType === "md") continue;
    let saving = false;
    try {
      const content =
        fileType === "twee"
          ? await fromTwee(file, convertOptions)
          : backfillMetadata(parseStoryJson(await file.text()), metadataConfig);
      saving = true;
      result.imported.push(
        saveEditableFile({
          projectId,
          name: stripFileExtension(file.name),
          fileType,
          content,
        }),
      );
      trackEvent("import_succeeded", {
        format: fileType,
        node_count_bucket: nodeCountBucket(content.nodes.length),
      });
    } catch (error) {
      trackEvent("import_failed", {
        format: fileType,
        error_class: analyticsError(error, saving),
      });
      result.failed.push({ fileName: file.name, reason: errorMessage(error) });
    }
  }

  if (markdown.length > 0) {
    const title = input.markdownTitle?.trim() ?? "";
    if (!title) {
      trackEvent("import_failed", {
        format: "obsidian",
        error_class: "missing_title",
      });
      result.failed.push(
        ...markdown.map((file) => ({
          fileName: file.name,
          reason: MARKDOWN_TITLE_REQUIRED_REASON,
        })),
      );
    } else {
      let saving = false;
      try {
        const content = await fromMd(markdown, title, convertOptions);
        saving = true;
        result.imported.push(
          saveEditableFile({ projectId, name: title, fileType: "md", content }),
        );
        trackEvent("import_succeeded", {
          format: "obsidian",
          node_count_bucket: nodeCountBucket(content.nodes.length),
        });
      } catch (error) {
        trackEvent("import_failed", {
          format: "obsidian",
          error_class: analyticsError(error, saving),
        });
        result.failed.push(
          ...markdown.map((file) => ({
            fileName: file.name,
            reason: errorMessage(error),
          })),
        );
      }
    }
  }

  return result;
};

export interface RunImportOptions {
  /**
   * Skip the post-import navigation. Used when part of a drop is still being
   * staged so the user is not yanked away from the staging panel.
   */
  stay?: boolean;
}

const isCleanImport = (result: ImportFilesResult) =>
  result.imported.length > 0 &&
  result.failed.length === 0 &&
  result.skipped.length === 0;

/**
 * `importFiles` plus the navigation rule: a clean single-file import opens
 * the file, a clean batch shows the project. Anything with failures stays on
 * the page so the summary remains visible.
 */
export const useImportFiles = () => {
  const navigate = useNavigate();
  const [isImporting, setIsImporting] = useState(false);

  const navigateAfterImport = useCallback(
    (imported: EditableFileRecord[], projectId: string) => {
      if (imported.length === 1) {
        void navigate({
          to: "/files/$fileId",
          params: { fileId: imported[0].id },
        });
      } else {
        void navigate({ to: "/projects/$projectId", params: { projectId } });
      }
    },
    [navigate],
  );

  const run = useCallback(
    async (input: ImportFilesInput, options: RunImportOptions = {}) => {
      setIsImporting(true);
      try {
        const result = await importFiles(input);
        if (!options.stay && isCleanImport(result)) {
          navigateAfterImport(result.imported, input.projectId);
        }
        return result;
      } finally {
        setIsImporting(false);
      }
    },
    [navigateAfterImport],
  );

  return { importFiles: run, isImporting };
};
