import path from "node:path";

import { describe, expect, it } from "vitest";

import { createMainWindowOptions } from "./main-window-options";

describe("createMainWindowOptions", () => {
  it("keeps the native window controls aligned with the custom titlebar", () => {
    const vitePublic = path.join("C:", "projects", "unfurl", "public");
    const preload = path.join("C:", "projects", "unfurl", "dist-electron", "preload.mjs");

    expect(createMainWindowOptions({ vitePublic, preload })).toMatchObject({
      title: "Unfurl",
      titleBarStyle: "hidden",
      titleBarOverlay: {
        color: "#3d3d3d",
        symbolColor: "#fff",
        height: 32,
      },
      icon: path.join(vitePublic, "UnfurlLogo.ico"),
      webPreferences: {
        preload,
        spellcheck: true,
      },
    });
  });
});
