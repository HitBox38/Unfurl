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
          if (id.includes("/lucide-react/")) return "lucide-react";
          if (id.includes("/radix-ui/")) return "radix-ui";
          if (id.includes("/@radix-ui/react-checkbox/")) return "radix-ui-react-checkbox";
          if (id.includes("/@radix-ui/react-dialog/")) return "radix-ui-react-dialog";
          if (id.includes("/@radix-ui/react-label/")) return "radix-ui-react-label";
          if (id.includes("/@radix-ui/react-popover/")) return "radix-ui-react-popover";
          if (id.includes("/@radix-ui/react-scroll-area/")) return "radix-ui-react-scroll-area";
          if (id.includes("/@radix-ui/react-select/")) return "radix-ui-react-select";
          if (id.includes("/@radix-ui/react-separator/")) return "radix-ui-react-separator";
          if (id.includes("/@radix-ui/react-slot/")) return "radix-ui-react-slot";
          if (id.includes("/@radix-ui/react-tooltip/")) return "radix-ui-react-tooltip";
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
