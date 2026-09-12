import { create } from "zustand";

import type { DialogContent, DialogState } from "./types";

export type {
  DialogAction,
  DialogActionVariant,
  DialogClassNames,
  DialogContent,
  DialogState,
} from "./types";

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
  setContent: (newContent) =>
    set(() => ({
      title: "",
      description: undefined,
      functions: undefined,
      isForm: undefined,
      formName: undefined,
      submitFunction: undefined,
      classNames: undefined,
      ...newContent,
    })),
  reset: () => set(() => ({ ...initialState })),
}));
