import { createContext, useContext } from "react";

export const SettingsContext = createContext<{
  open: (trigger: HTMLButtonElement) => void;
  updateAvailable: boolean;
} | null>(null);

export const useSettingsDialog = () => {
  const context = useContext(SettingsContext);
  if (!context) throw new Error("Settings must wrap its sidebar trigger");
  return context;
};
