import path from "node:path";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import svgr from "vite-plugin-svgr";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(
      JSON.parse(readFileSync(path.join(projectRoot, "package.json"), "utf8")).version,
    ),
  },

  plugins: [
    react(),
    // Mirror vite.config.ts so `.svg` imports are components in tests too.
    svgr({
      svgrOptions: {
        exportType: "default",
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: /\.svg(\?react)?$/,
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(projectRoot, "src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    css: false,
    coverage: {
      reporter: ["text", "html"],
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.test.{ts,tsx}", "src/test/**/*", "src/shared/ui/**"],
    },
  },
});
