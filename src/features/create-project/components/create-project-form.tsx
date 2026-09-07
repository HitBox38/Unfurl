import { useFormContext } from "react-hook-form";

import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

/** Body of the "New project" dialog; the dialog host owns the form instance. */
export const CreateProjectForm = () => {
  const { register } = useFormContext<{ name: string }>();

  return (
    <div className="flex flex-col gap-2 pt-2 text-left">
      <Label htmlFor="create-project-name">Project name</Label>
      <Input
        id="create-project-name"
        autoFocus
        placeholder="e.g. Space RPG"
        {...register("name", { required: true })}
      />
      <p className="text-xs text-muted-foreground">
        Each project keeps its own files and Metadata Config.
      </p>
    </div>
  );
};
