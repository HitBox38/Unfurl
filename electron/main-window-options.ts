import type { BrowserWindowConstructorOptions } from "electron";

import { DEFAULT_THEME } from "@/shared/hooks/use-theme/constants";

import { getInitialTitleBarOverlay } from "./title-bar-overlay";

type MainWindowOptionsInput = {
  preload: string;
  appIcon: string;
};

export const createMainWindowOptions = ({
  preload,
  appIcon,
}: MainWindowOptionsInput): BrowserWindowConstructorOptions => ({
  icon: appIcon,
  webPreferences: {
    preload,
    spellcheck: true,
  },
  title: "Unfurl",
  titleBarStyle: "hidden",
  minHeight: 500,
  minWidth: 800,
  titleBarOverlay: getInitialTitleBarOverlay(DEFAULT_THEME),
});
