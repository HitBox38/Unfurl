import type { BrowserWindowConstructorOptions } from "electron";

type MainWindowOptionsInput = {
  preload: string;
  appIcon: string;
};

const TITLE_BAR_OVERLAY_HEIGHT = 32;
const TITLE_BAR_OVERLAY_COLOR = "#3d3d3d";

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
  titleBarOverlay: {
    color: TITLE_BAR_OVERLAY_COLOR,
    symbolColor: "#fff",
    height: TITLE_BAR_OVERLAY_HEIGHT,
  },
});
