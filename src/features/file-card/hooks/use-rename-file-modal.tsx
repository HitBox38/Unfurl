import { useCallback } from "react";
import { useFormContext } from "react-hook-form";

import {
  updateEditableFileName,
  type EditableFileRecord,
} from "@/shared/lib/editable-files-storage";
import { useDialogStore } from "@/shared/stores";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

import { RENAME_FILE_FORM_NAME } from "../constants";

interface RenameFileFormProps {
  currentName: string;
}

const RenameFileForm = ({ currentName }: RenameFileFormProps) => {
  const { register } = useFormContext<{ name: string }>();

  return (
    <div className="flex flex-col gap-2 pt-2 text-left">
      <Label htmlFor="rename-file-name">File name</Label>
      <Input
        id="rename-file-name"
        autoFocus
        {...register("name", { required: true, value: currentName })}
      />
    </div>
  );
};

/** Returns a function that opens the "Rename file" dialog for a record. */
export const useRenameFileModal = () => {
  const setContent = useDialogStore((state) => state.setContent);

  return useCallback(
    (file: EditableFileRecord) =>
      setContent({
        isOpen: true,
        title: "Rename file",
        isForm: true,
        formName: RENAME_FILE_FORM_NAME,
        content: <RenameFileForm currentName={file.name} />,
        classNames: { dialog: "sm:max-w-md" },
        functions: [
          {
            isSubmit: true,
            name: "Rename",
            variant: "default",
            action: () => {
              /* the form submit persists the name */
            },
          },
        ],
        submitFunction: (data) => {
          const name = String(data.name ?? "").trim();
          if (name && name !== file.name) {
            updateEditableFileName(file.id, name);
          }
        },
      }),
    [setContent],
  );
};
