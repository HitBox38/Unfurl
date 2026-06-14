import type { BrowserWindow, BrowserWindowConstructorOptions } from "electron";

import type { Theme } from "@/shared/hooks/use-theme/constants";
import {
  TITLE_BAR_OVERLAY_HEIGHT,
  getTitleBarOverlayForTheme,
  type TitleBarOverlayOptions,
} from "@/shared/types/title-bar-overlay";

export const supportsMutableTitleBarOverlay = (
  platform: NodeJS.Platform = process.platform,
): boolean => platform === "win32" || platform === "linux";

export const getInitialTitleBarOverlay = (
  theme: Theme,
  platform: NodeJS.Platform = process.platform,
): NonNullable<BrowserWindowConstructorOptions["titleBarOverlay"]> => {
  if (supportsMutableTitleBarOverlay(platform)) {
    return getTitleBarOverlayForTheme(theme);
  }

  return { height: TITLE_BAR_OVERLAY_HEIGHT };
};

export const applyTitleBarOverlay = (
  window: BrowserWindow,
  options: TitleBarOverlayOptions,
): void => {
  if (!supportsMutableTitleBarOverlay()) {
    return;
  }

  if (typeof window.setTitleBarOverlay !== "function") {
    return;
  }

  window.setTitleBarOverlay(options);
};
