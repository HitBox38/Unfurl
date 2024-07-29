/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { ReactNode } from "react";
import { SubmitHandler } from "react-hook-form";
import { SxProps } from "@mui/material";

export interface DialogStore {
  title: string;
  isOpen: boolean;
  content: ReactNode;
  functions?: {
    name: string;
    disabled: boolean;
    action: ([any]: any) => void;
    isSubmit: boolean;
  }[];
  isForm?: boolean;
  formName?: string;
  submitFunction?: SubmitHandler<any>;
  style?: {
    dialog?: SxProps;
    dialogTitle?: SxProps;
    dialogContent?: SxProps;
    dialogActions?: SxProps;
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
