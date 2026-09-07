import { useFormContext } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

interface RenameFileFormProps {
  currentName: string;
}

/** Body of the "Rename file" dialog; the dialog host owns the form instance. */
export const RenameFileForm = ({ currentName }: RenameFileFormProps) => {
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
