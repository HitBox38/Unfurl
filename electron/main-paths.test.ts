import path from "node:path";
import { pathToFileURL } from "node:url";

import { describe, expect, it } from "vitest";

import { resolveAppIconPath, resolveMainProcessPaths } from "./main-paths";

describe("resolveMainProcessPaths", () => {
  it("resolves ESM-safe Electron paths from the main module URL", () => {
    const appRoot = path.resolve(
      path.parse(process.cwd()).root,
      "projects",
      "unfurl"
    );
    const mainModuleUrl = pathToFileURL(
      path.join(appRoot, "dist-electron", "main.js")
    ).href;

    expect(resolveMainProcessPaths(mainModuleUrl, false)).toEqual({
      dist: path.join(appRoot, "dist"),
      vitePublic: path.join(appRoot, "public"),
      preload: path.join(appRoot, "dist-electron", "preload.mjs"),
      appIcon: path.join(appRoot, "public", "UnfurlLogo.ico"),
    });

    expect(resolveMainProcessPaths(mainModuleUrl, true)).toEqual({
      dist: path.join(appRoot, "dist"),
      vitePublic: path.join(appRoot, "dist"),
      preload: path.join(appRoot, "dist-electron", "preload.mjs"),
      appIcon: path.join(appRoot, "dist", "UnfurlLogo.ico"),
    });
  });

  it("resolves the app icon outside app.asar when packaged on Windows", () => {
    const distInAsar = path.join(
      "C:",
      "Program Files",
      "Unfurl",
      "resources",
      "app.asar",
      "dist"
    );

    expect(resolveAppIconPath(distInAsar, true)).toBe(
      path.join(
        "C:",
        "Program Files",
        "Unfurl",
        "resources",
        "app.asar.unpacked",
        "dist",
        "UnfurlLogo.ico"
      )
    );
  });
});
