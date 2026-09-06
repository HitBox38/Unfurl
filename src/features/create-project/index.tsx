import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useCallback } from "react";

import { createProject } from "@/shared/lib/projects-storage";
import {
  useDialogStore,
  type DialogContent as DialogContentValue,
} from "@/shared/stores";
import { Button } from "@/shared/ui/button";

import { CreateProjectForm } from "./components/create-project-form";
import { CREATE_PROJECT_FORM_NAME } from "./constants";

/** Returns a function that opens the "New project" dialog. */
export const useCreateProjectModal = () => {
  const setContent = useDialogStore((state) => state.setContent);
  const navigate = useNavigate();

  return useCallback(() => {
    const content: DialogContentValue = {
      isOpen: true,
      title: "New project",
      isForm: true,
      formName: CREATE_PROJECT_FORM_NAME,
      content: <CreateProjectForm />,
      classNames: { dialog: "sm:max-w-md" },
      functions: [
        {
          isSubmit: true,
          name: "Create project",
          variant: "default",
          action: () => {
            /* the form submit creates the project */
          },
        },
      ],
      submitFunction: (data) => {
        const project = createProject({ name: String(data.name ?? "") });
        void navigate({
          to: "/projects/$projectId",
          params: { projectId: project.id },
        });
      },
    };
    setContent(content);
  }, [navigate, setContent]);
};

/** Header action that opens the "New project" dialog. */
export const NewProjectButton = () => {
  const openCreateProject = useCreateProjectModal();

  return (
    <Button type="button" variant="secondary" onClick={openCreateProject}>
      <Plus aria-hidden="true" />
      New project
    </Button>
  );
};
