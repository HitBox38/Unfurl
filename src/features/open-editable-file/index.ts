import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import { saveEditableFile } from "@/shared/lib/editable-files-storage";
import { useJsonDataStore } from "@/shared/stores";
import type { StoryData, SupportedFileType } from "@/shared/types";

/** Persists a converted story into `projectId`, loads it, and opens its page. */
export const useOpenEditableFile = () => {
  const setJsonData = useJsonDataStore((state) => state.setJson);
  const navigate = useNavigate();

  return useCallback(
    (
      content: StoryData,
      name: string,
      fileType: SupportedFileType,
      projectId: string,
    ) => {
      const record = saveEditableFile({
        projectId,
        name: name.trim() || "Untitled",
        fileType,
        content,
      });
      setJsonData(record.content, record.name, record.id, record.projectId);
      void navigate({
        to: "/files/$fileId",
        params: { fileId: record.id },
      });
      return record;
    },
    [navigate, setJsonData],
  );
};
