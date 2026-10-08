import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";

import { router } from "@/app/router";
import { initAnalytics, subscribeRouteAnalytics } from "@/shared/lib/analytics";
import { initTheme } from "@/shared/hooks/use-theme";
import { migrateStorage } from "@/shared/lib/projects-storage";
import { recoverMetadataTransaction } from "@/shared/lib/project-metadata-refactor";
import "@/styles/index.css";

initTheme();
recoverMetadataTransaction();
migrateStorage();
initAnalytics();
subscribeRouteAnalytics(router);

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found in index.html");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Suspense>
      <RouterProvider router={router} />
    </Suspense>
  </React.StrictMode>,
);

postMessage({ payload: "removeLoading" }, "*");

window.ipcRenderer?.on("main-process-message", (_event, message) => {
  console.log(message);
});
