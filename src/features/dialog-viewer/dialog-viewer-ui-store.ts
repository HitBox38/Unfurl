import { create } from "zustand";

export interface DialogViewerUiState {
  isDeleteMode: boolean;
  toggleDeleteMode: () => void;
  setDeleteMode: (enabled: boolean) => void;
  reset: () => void;
}

export const useDialogViewerUiStore = create<DialogViewerUiState>((set) => ({
  isDeleteMode: false,
  toggleDeleteMode: () =>
    set((state) => ({ isDeleteMode: !state.isDeleteMode })),
  setDeleteMode: (enabled) => set({ isDeleteMode: enabled }),
  reset: () => set({ isDeleteMode: false }),
}));
