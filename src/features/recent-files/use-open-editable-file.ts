import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

import { useJsonDataStore } from "@/shared/stores";
import type { StoryData, SupportedFileType } from "@/shared/types";

import { saveEditableFile } from "@/features/recent-files/recent-files-storage";

export const useOpenEditableFile = () => {
  const setJsonData = useJsonDataStore((state) => state.setJson);
  const navigate = useNavigate();

  return useCallback(
    (content: StoryData, name: string, fileType: SupportedFileType) => {
      const record = saveEditableFile({
        name: name.trim() || "Untitled",
        fileType,
        content,
      });
      setJsonData(record.content, record.name, record.id);
      void navigate({
        to: "/files/$fileId",
        params: { fileId: record.id },
      });
      return record;
    },
    [navigate, setJsonData],
  );
};
