import { usePreference } from "@/shared/hooks/use-preference";
import { createPreference } from "@/shared/lib/preference-store";

export type SidebarMode = "automatic" | "expanded" | "collapsed";
export const sidebarPreference = createPreference<SidebarMode>(
  "unfurl.sidebar-startup.v1",
  "automatic",
  (value): value is SidebarMode =>
    value === "automatic" || value === "expanded" || value === "collapsed",
);
export const automaticUpdatesPreference = createPreference<boolean>(
  "unfurl.automatic-updates.v1",
  true,
  (value): value is boolean => typeof value === "boolean",
);
export const useSidebarPreference = () => usePreference(sidebarPreference);
export const useAutomaticUpdates = () =>
  usePreference(automaticUpdatesPreference);
