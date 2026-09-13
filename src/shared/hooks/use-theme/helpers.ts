import {
  getTitleBarOverlayForTheme,
  TITLE_BAR_OVERLAY_CHANNEL,
} from "@/shared/types/title-bar-overlay";
import { createPreference } from "@/shared/lib/preference-store";

import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  type Theme,
  type ResolvedTheme,
} from "./constants";

export const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark" || value === "system";
export const themePreference = createPreference<Theme>(
  THEME_STORAGE_KEY,
  DEFAULT_THEME,
  isTheme,
);
export const resolveTheme = (theme: Theme): ResolvedTheme =>
  theme === "system"
    ? window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light"
    : theme;
export const syncTitleBarOverlay = (theme: ResolvedTheme) => {
  window.ipcRenderer?.send(
    TITLE_BAR_OVERLAY_CHANNEL,
    getTitleBarOverlayForTheme(theme),
  );
};
export const applyTheme = (theme: ResolvedTheme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
  syncTitleBarOverlay(theme);
};
export const readStoredTheme = themePreference.read;
export const initTheme = () => applyTheme(resolveTheme(readStoredTheme()));
