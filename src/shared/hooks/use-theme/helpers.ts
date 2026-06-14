import { DEFAULT_THEME, THEME_STORAGE_KEY, type Theme } from "./constants";

export const isTheme = (value: unknown): value is Theme =>
  value === "light" || value === "dark";

export const applyTheme = (theme: Theme) => {
  document.documentElement.classList.toggle("dark", theme === "dark");
};

export const readStoredTheme = (): Theme => {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (!stored) return DEFAULT_THEME;

  try {
    const parsed: unknown = JSON.parse(stored);
    return isTheme(parsed) ? parsed : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
};

export const initTheme = () => {
  applyTheme(readStoredTheme());
};
