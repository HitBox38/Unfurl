import path from "node:path";
import { fileURLToPath } from "node:url";

type MainProcessPaths = {
  dist: string;
  vitePublic: string;
  preload: string;
};

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
  };
}
