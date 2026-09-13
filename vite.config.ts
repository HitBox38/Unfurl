import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, loadEnv, type Plugin } from "vite";
import electron from "vite-plugin-electron/simple";
import svgr from "vite-plugin-svgr";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

const electronPreloadOutputCompat = (): Plugin => {
  return {
    name: "electron-preload-output-compat",
    configResolved(config) {
      const output = config.build.rollupOptions?.output;
      if (output == null || Array.isArray(output)) return;
      delete (output as { inlineDynamicImports?: boolean })
        .inlineDynamicImports;
      output.codeSplitting = false;
    },
  };
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, projectRoot, "VITE_PUBLIC_");
  const distribution =
    env.VITE_PUBLIC_DISTRIBUTION || (mode === "web" ? "web" : "");
  if (
    distribution &&
    !["web", "desktop_github", "desktop_itch"].includes(distribution)
  ) {
    throw new Error(
      "VITE_PUBLIC_DISTRIBUTION must be web, desktop_github, or desktop_itch",
    );
  }
  if (mode === "web" && distribution !== "web")
    throw new Error("Web builds must use the web distribution");
  return {
    base: mode === "web" ? "/" : "./",
    define: {
      "import.meta.env.VITE_PUBLIC_DISTRIBUTION": JSON.stringify(distribution),
      __APP_VERSION__: JSON.stringify(
        JSON.parse(readFileSync(path.join(projectRoot, "package.json"), "utf8"))
          .version,
      ),
    },
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
            if (id.includes("/@radix-ui/react-checkbox/"))
              return "radix-ui-react-checkbox";
            if (id.includes("/@radix-ui/react-dialog/"))
              return "radix-ui-react-dialog";
            if (id.includes("/@radix-ui/react-label/"))
              return "radix-ui-react-label";
            if (id.includes("/@radix-ui/react-popover/"))
              return "radix-ui-react-popover";
            if (id.includes("/@radix-ui/react-scroll-area/"))
              return "radix-ui-react-scroll-area";
            if (id.includes("/@radix-ui/react-select/"))
              return "radix-ui-react-select";
            if (id.includes("/@radix-ui/react-separator/"))
              return "radix-ui-react-separator";
            if (id.includes("/@radix-ui/react-slot/"))
              return "radix-ui-react-slot";
            if (id.includes("/@radix-ui/react-tooltip/"))
              return "radix-ui-react-tooltip";
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
        include: /\.svg(\?react)?$/,
      }),
      react(),
      tailwindcss(),
      mode !== "web" &&
        electron({
          main: {
            entry: "electron/main.ts",
          },
          preload: {
            input: path.join(projectRoot, "electron/preload.ts"),
            vite: {
              plugins: [electronPreloadOutputCompat()],
            },
          },
        }),
    ],
  };
});
