import { useCallback, useEffect } from "react";

import { useStorage } from "@/shared/hooks/use-storage";

import { DEFAULT_THEME, THEME_STORAGE_KEY, type Theme } from "./constants";
import { applyTheme } from "./helpers";

export { initTheme } from "./helpers";
export type { Theme } from "./constants";

export const useTheme = () => {
  const [theme, setTheme] = useStorage<Theme>({
    key: THEME_STORAGE_KEY,
    defaultValue: DEFAULT_THEME,
  });

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === "dark" ? "light" : "dark");
  }, [setTheme, theme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === "dark",
  };
};
