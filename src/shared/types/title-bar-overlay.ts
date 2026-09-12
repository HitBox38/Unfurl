import type { Theme } from "@/shared/hooks/use-theme/constants";

export const TITLE_BAR_OVERLAY_CHANNEL = "title-bar-overlay:set";

export const TITLE_BAR_OVERLAY_HEIGHT = 32;

export type TitleBarOverlayOptions = {
  color: string;
  symbolColor: string;
  height: number;
};

/** Hex colors matching --sidebar / --sidebar-foreground in index.css */
export const TITLE_BAR_OVERLAY_BY_THEME = {
  light: {
    color: "#fafafa",
    symbolColor: "#09090b",
  },
  dark: {
    color: "#18181b",
    symbolColor: "#fafafa",
  },
} as const satisfies Record<
  Theme,
  Pick<TitleBarOverlayOptions, "color" | "symbolColor">
>;

export const getTitleBarOverlayForTheme = (
  theme: Theme,
): TitleBarOverlayOptions => ({
  ...TITLE_BAR_OVERLAY_BY_THEME[theme],
  height: TITLE_BAR_OVERLAY_HEIGHT,
});

export const isTitleBarOverlayOptions = (
  value: unknown,
): value is TitleBarOverlayOptions => {
  if (!value || typeof value !== "object") return false;

  const options = value as Partial<TitleBarOverlayOptions>;
  return (
    typeof options.color === "string" &&
    typeof options.symbolColor === "string" &&
    typeof options.height === "number"
  );
};
