import path from "node:path";
import { fileURLToPath } from "node:url";

const APP_ICON_FILENAME = "UnfurlLogo.ico";

type MainProcessPaths = {
  dist: string;
  vitePublic: string;
  preload: string;
  appIcon: string;
};

/** Windows cannot load .ico from inside app.asar; use the asar-unpacked copy when packaged. */
export function resolveAppIconPath(
  distDirectory: string,
  isPackaged: boolean
): string {
  const iconInDist = path.join(distDirectory, APP_ICON_FILENAME);

  if (!isPackaged) {
    return path.join(distDirectory, "..", "public", APP_ICON_FILENAME);
  }

  return iconInDist.includes("app.asar")
    ? iconInDist.replace("app.asar", "app.asar.unpacked")
    : iconInDist;
}

export function resolveMainProcessPaths(
  mainModuleUrl: string,
  isPackaged: boolean
): MainProcessPaths {
  const mainDirectory = path.dirname(fileURLToPath(mainModuleUrl));
  const dist = path.join(mainDirectory, "../dist");

  return {
    dist,
    vitePublic: isPackaged ? dist : path.join(dist, "../public"),
    preload: path.join(mainDirectory, "preload.mjs"),
    appIcon: resolveAppIconPath(dist, isPackaged),
  };
}
