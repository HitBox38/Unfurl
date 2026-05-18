import {
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";

import App from "@/app/app";
import { FilePage, HomePage } from "@/app/pages";

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

const fileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/files/$fileId",
  component: FilePage,
});

const routeTree = rootRoute.addChildren([indexRoute, fileRoute]);

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
