export {
  EDITABLE_FILES_STORAGE_KEY,
  getEditableFile,
  listEditableFiles,
  saveEditableFile,
  searchEditableFiles,
  updateEditableFileContent,
  updateEditableFileName,
  type EditableFileDraft,
  type EditableFileRecord,
} from "@/features/recent-files/recent-files-storage";
export { RecentFilesSidebar } from "@/features/recent-files/recent-files-sidebar";
export { useOpenEditableFile } from "@/features/recent-files/use-open-editable-file";
