import { create } from "zustand";
import { ReactNode } from "react";
import { FieldValues, SubmitHandler } from "react-hook-form";
import { ButtonProps } from "@mui/material";

export interface DialogStore {
  title: string;
  isOpen: boolean;
  content: ReactNode;
  functions?: (ButtonProps & {
    name: string;
    action: (args: unknown) => void;
    isSubmit?: boolean;
    closeAfterwards?: boolean;
  })[];
  isForm?: boolean;
  formName?: string;
  submitFunction?: SubmitHandler<FieldValues>;
  classNames?: {
    dialog?: string;
    dialogTitle?: string;
    dialogContent?: string;
    dialogActions?: string;
  };
  setOpen: () => void;
  setContent: (newContent: Omit<DialogStore, "setOpen" | "setContent">) => void;
}

export const useDialogStore = create<DialogStore>((set) => ({
  title: "",
  isOpen: false,
  content: <></>,
  setOpen: () => set((state) => ({ ...state, isOpen: !state.isOpen })),
  setContent: (newContent) => set((state) => ({ ...state, ...newContent })),
}));
