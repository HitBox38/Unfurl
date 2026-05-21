import {
  createBrowserHistory,
  createHashHistory,
  type RouterHistory,
} from "@tanstack/react-router";

export const createRuntimeHistory = (
  runtimeWindow: Window = window,
): RouterHistory => {
  if (runtimeWindow.location.protocol === "file:") {
    return createHashHistory({ window: runtimeWindow });
  }

  return createBrowserHistory({ window: runtimeWindow });
};
