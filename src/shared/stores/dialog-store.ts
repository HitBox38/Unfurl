import type { ReactNode } from "react";
import type { FieldValues, SubmitHandler } from "react-hook-form";
import { create } from "zustand";

import type { ButtonProps } from "@/shared/ui/button";

export type DialogActionVariant = NonNullable<ButtonProps["variant"]>;

export interface DialogAction {
  name: string;
  action: (event?: unknown) => void;
  isSubmit?: boolean;
  disabled?: boolean;
  variant?: DialogActionVariant;
  closeAfterwards?: boolean;
  className?: string;
}

export interface DialogClassNames {
  dialog?: string;
  dialogTitle?: string;
  dialogContent?: string;
  dialogActions?: string;
}

export interface DialogContent {
  title?: string;
  isOpen: boolean;
  content: ReactNode;
  functions?: DialogAction[];
  isForm?: boolean;
  formName?: string;
  submitFunction?: SubmitHandler<FieldValues>;
  classNames?: DialogClassNames;
}

export interface DialogState extends DialogContent {
  setOpen: (isOpen?: boolean) => void;
  setContent: (newContent: DialogContent) => void;
  reset: () => void;
}

const initialState: DialogContent = {
  title: "",
  isOpen: false,
  content: null,
};

export const useDialogStore = create<DialogState>((set) => ({
  ...initialState,
  setOpen: (isOpen) =>
    set((state) => ({
      isOpen: typeof isOpen === "boolean" ? isOpen : !state.isOpen,
    })),
  setContent: (newContent) => set(() => ({ ...newContent })),
  reset: () => set(() => ({ ...initialState })),
}));
