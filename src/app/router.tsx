import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import App from "@/app/app";
import { FilePage } from "@/app/pages/file-page";
import { HomePage } from "@/app/pages/home-page";
import { ProjectPage } from "@/app/pages/project-page";
import { createRuntimeHistory } from "@/app/router-history";

const isOnlineHost = () =>
  typeof location !== "undefined" &&
  location.hostname.includes(".vercel.app") &&
  location.hostname.includes("unfurl");

const rootRoute = createRootRoute({
  component: App,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: () => <HomePage isOnline={isOnlineHost()} />,
});

const projectRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/projects/$projectId",
  component: ProjectPage,
});

const fileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/files/$fileId",
  component: FilePage,
});

const routeTree = rootRoute.addChildren([indexRoute, projectRoute, fileRoute]);

export const router = createRouter({
  routeTree,
  history: createRuntimeHistory(),
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
