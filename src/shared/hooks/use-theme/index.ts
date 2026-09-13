import { useCallback, useEffect, useSyncExternalStore } from "react";

import { usePreference } from "@/shared/hooks/use-preference";

import { applyTheme, resolveTheme, themePreference } from "./helpers";

export { initTheme } from "./helpers";
export type { Theme, ResolvedTheme } from "./constants";

export const useTheme = () => {
  const [theme, setTheme, error] = usePreference(themePreference);
  const subscribe = useCallback(
    (listener: () => void) => {
      if (theme !== "system") return () => {};
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      media.addEventListener("change", listener);
      return () => media.removeEventListener("change", listener);
    },
    [theme],
  );
  const resolvedTheme = useSyncExternalStore(subscribe, () =>
    resolveTheme(theme),
  );
  return {
    theme,
    resolvedTheme,
    setTheme,
    error,
    isDark: resolvedTheme === "dark",
  };
};

export const useThemeSync = () => {
  const { resolvedTheme } = useTheme();
  useEffect(() => applyTheme(resolvedTheme), [resolvedTheme]);
};
