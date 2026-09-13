import { useEffect, useState } from "react";

import {
  useSidebarPreference,
  type SidebarMode,
} from "../use-settings-preferences";

export const resolveSidebarOpen = (
  mode: SidebarMode,
  desktop: boolean,
  width: number,
) => (mode === "automatic" ? desktop || width >= 1024 : mode === "expanded");

export const useSidebarStartup = (desktop: boolean) => {
  const [mode] = useSidebarPreference();
  const [state, setState] = useState(() => ({
    mode,
    open: resolveSidebarOpen(mode, desktop, window.innerWidth),
  }));
  if (state.mode !== mode) {
    setState({
      mode,
      open: resolveSidebarOpen(mode, desktop, window.innerWidth),
    });
  }
  useEffect(() => {
    if (mode !== "automatic" || desktop) return;
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = () => setState({ mode, open: media.matches });
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [desktop, mode]);
  return [state.open, (open: boolean) => setState({ mode, open })] as const;
};
