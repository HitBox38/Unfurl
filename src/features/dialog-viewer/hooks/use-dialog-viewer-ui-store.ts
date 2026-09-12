import { create } from "zustand";

import type { DialogViewerUiState } from "../types";

export const useDialogViewerUiStore = create<DialogViewerUiState>((set) => ({
  isDeleteMode: false,
  toggleDeleteMode: () =>
    set((state) => ({ isDeleteMode: !state.isDeleteMode })),
  setDeleteMode: (enabled) => set({ isDeleteMode: enabled }),
  reset: () => set({ isDeleteMode: false }),
}));
