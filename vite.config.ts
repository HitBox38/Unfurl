import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import electron from "vite-plugin-electron/simple";
import svgr from "vite-plugin-svgr";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes("@xyflow/react")) return "xyflow";
          if (id.includes("/dagre/")) return "dagre";
          return undefined;
        },
      },
    },
  },
  plugins: [
    svgr({
      svgrOptions: {
        exportType: "default",
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: "**/*.svg",
    }),
    react(),
    tailwindcss(),
    electron({
      main: {
        entry: "electron/main.ts",
      },
      preload: {
        input: path.join(projectRoot, "electron/preload.ts"),
      },
    }),
  ],
});
