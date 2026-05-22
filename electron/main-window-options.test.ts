import path from "node:path";

import { describe, expect, it } from "vitest";

import { createMainWindowOptions } from "./main-window-options";

describe("createMainWindowOptions", () => {
  it("keeps the native window controls aligned with the custom titlebar", () => {
    const appIcon = path.join("C:", "projects", "unfurl", "public", "UnfurlLogo.ico");
    const preload = path.join("C:", "projects", "unfurl", "dist-electron", "preload.mjs");

    expect(createMainWindowOptions({ appIcon, preload })).toMatchObject({
      title: "Unfurl",
      titleBarStyle: "hidden",
      titleBarOverlay: {
        color: "#3d3d3d",
        symbolColor: "#fff",
        height: 32,
      },
      icon: appIcon,
      webPreferences: {
        preload,
        spellcheck: true,
      },
    });
  });
});
