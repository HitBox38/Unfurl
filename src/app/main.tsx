import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";

import App from "@/app/app";
import "@/styles/index.css";

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found in index.html");
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <Suspense>
      <App />
    </Suspense>
  </React.StrictMode>,
);

postMessage({ payload: "removeLoading" }, "*");

window.ipcRenderer?.on("main-process-message", (_event, message) => {
  console.log(message);
});
