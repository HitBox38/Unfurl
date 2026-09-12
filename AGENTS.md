# Unfurl — agent guide

Unfurl is an Electron + Vite + React desktop & web app for converting and editing
branching dialog files (Twee, Obsidian markdown, JSON). This file tells humans
and AI agents the conventions and commands they need to be productive here
without breaking anything.

## Cursor Cloud specific instructions

Unfurl is a client-side dialog/story file editor. **No databases or backend
services are required** — everything runs in the renderer / Electron process
against the user's filesystem and `localStorage`.

In headless cloud environments the Electron main process will emit GPU /
D-Bus errors on `pnpm dev`, but the Vite renderer still serves the app at
the printed URL (default `http://localhost:5173`). For manual UI testing in
the cloud, prefer `pnpm preview` against a fresh `pnpm build` — it's
deterministic and binds cleanly to `127.0.0.1`.

## Stack

- **Bundler**: Vite 8 (`vite.config.ts`) with `@vitejs/plugin-react`,
  `vite-plugin-electron/simple`, `vite-plugin-svgr`, and `@tailwindcss/vite`.
- **Runtime**: React 19, Electron 42, TypeScript 6.
- **State**: Zustand 5 stores under `src/shared/stores`.
- **Graph**: `@xyflow/react` (formerly `reactflow`) plus `dagre` for layout.
- **Forms**: `react-hook-form` 7.
- **UI**: Tailwind v4 utilities with shadcn/ui primitives in `src/shared/ui/`
  (`Button`, `Card`, `Dialog`, `Input`, `Select`, …), Lucide icons. The
  shadcn config lives in `components.json`; the theme tokens live in
  `src/styles/index.css`.
- **Tests**: Vitest 4 + Testing Library on jsdom. Setup file
  `src/test/setup.ts` patches the jsdom gaps Radix UI expects (pointer
  capture, `ResizeObserver`).
- **Lint**: ESLint 10 flat config (`eslint.config.js`) with
  `typescript-eslint`, `eslint-plugin-react-hooks`, and
  `eslint-plugin-react-refresh`.
- **Package manager**: **pnpm 11** (pinned via `packageManager`); never use
  npm or yarn in this repo. The lockfile is `pnpm-lock.yaml`; workspace
  settings live in `pnpm-workspace.yaml`; supply-chain exclusions and
  pre-approved build scripts live there too.

## Folder layout

```
src/
  app/                     # Bootstrap: providers, App shell, main entry
    app.tsx
    main.tsx
  features/                # One folder per public export; root in `index.tsx`
    demo/
    dialog-viewer/
    add-node-button/
    download/
    faq/
    file-upload/
    metadata-config/
    metadata-config-form/
    node-editor/
    recent-files-sidebar/
    open-editable-file/
    …
  shared/
    components/            # Cross-feature composites (every-where-dialog/, …)
    hooks/                 # use-storage/, use-mobile/, …
    lib/                   # cn/, convertors/, editable-files-storage/, …
    stores/                # dialog-store/, json-data-store/, node-store/
    types/                 # Choice, StoryNode, StoryData, MetadataConfigTemplate
    ui/                    # shadcn-generated primitives — DO NOT edit casually
  assets/                  # Static images, svg
  styles/                  # Tailwind entry + custom CSS
  test/                    # Vitest setup + fixtures
electron/                  # Main and preload bundles
public/                    # Static files served at /
```

### Conventions

- **Absolute imports**: always use the `@/` alias (`@/shared/...`,
  `@/features/<name>`, `@/app/...`). No `../../` paths crossing feature
  boundaries.
- **Module folder layout**: each `src/features/<name>/`, `src/shared/lib/<name>/`,
  `src/shared/stores/<name>/`, and `src/shared/hooks/<name>/` uses
  `index.ts` or `index.tsx` for the root export — not a re-export-only
  barrel. Optional siblings: `types.ts`, `constants.ts`, `helpers.ts`,
  `hooks/`, `components/`, `__tests__/`. Import via the package barrel
  (`@/features/<name>`, `@/shared/lib`, `@/shared/stores`, `@/shared/hooks`)
  or the module folder. Split multi-export domains into sibling folders.
- **Imports at the top of the file.** No inline `await import()` for plain
  module imports; use `await import()` only when you need real lazy
  loading. Imports go above all other code.
- **UI primitives** in `src/shared/ui/` mirror what `shadcn add` would
  generate. Re-run shadcn to refresh them; don't edit ad hoc.
- **Tailwind utilities** + shadcn primitives + Lucide icons. No MUI, no
  emotion, no `tss-react`.
- **Comments**: explain non-obvious *why* only. Don't narrate code.
- **Tests** live in `__tests__/` inside the feature folder (e.g.
  `__tests__/demo-button.test.tsx`).

## Commands

```bash
# install
pnpm install

# dev (renderer + electron main + preload with HMR)
pnpm dev

# typecheck (composite tsc -b)
pnpm typecheck

# lint (flat config, zero-warning gate)
pnpm lint

# tests
pnpm test            # one-shot vitest run
pnpm test:watch
pnpm test:coverage

# build + package
pnpm build           # tsc -b && vite build (renderer + electron)
pnpm build:linux     # → release/Unfurl-Linux.AppImage
pnpm build:mac       # → release/Unfurl-Mac-Installer.dmg
pnpm build:windows   # → release/Unfurl-Windows-Setup.exe

# preview a built renderer
pnpm preview
```

All four gates (`lint`, `test`, `typecheck`, `build`) must pass before
opening a PR. CI in `.github/workflows/*.yaml` reruns them on every push to
`master`.

## Adding a new feature

1. Create `src/features/<feature>/` with `index.tsx` containing the root
   component or hook. Add `types.ts`, `constants.ts`, `helpers.ts`,
   `hooks/`, `components/`, and `__tests__/` as needed.
2. If the feature owns a store, put it under `hooks/` in that folder.
   Only cross-cutting stores (Dialog/JsonData/Node) live in
   `src/shared/stores/`.
3. Put tests in `__tests__/`.
4. Wire the feature into `src/app/app.tsx` (or wherever it belongs) via
   `@/features/<feature>`.

## Adding a new shadcn primitive

```bash
pnpm dlx shadcn@latest add <component>
```

`components.json` is configured to drop new primitives into
`src/shared/ui/` and the utility helper into `src/shared/lib/cn`.

## Electron bits

- `electron/main.ts` boots the main process and creates the window. The
  `vite-plugin-electron/simple` plugin handles bundling and HMR for both
  `main` and `preload` from `vite.config.ts`.
- `electron/preload.ts` exposes `ipcRenderer` to the renderer through
  `contextBridge`.
- `electron-builder.json5` controls packaging. `electron-builder` is
  invoked by the `build:linux|mac|windows` scripts after `pnpm build`.
- `dist-electron/` is the build output for the main + preload bundles;
  `dist/` is the renderer; both are gitignored.

## Sample data

`public/Lorcan02.1.twee` is a sample Twee dialog file that can be imported
via the app's upload UI (or unlocked through the Konami code in the
`features/demo` button) to verify the graph editor works end-to-end.

## Don't

- Don't re-introduce MUI, `@emotion/*`, or `tss-react` — the migration
  to shadcn + Tailwind is one-way.
- Don't import from `reactflow`. The renamed package is `@xyflow/react`.
- Don't commit `node_modules`, `dist`, `dist-electron`, `release`,
  `coverage`, or `package-lock.json`.
- Don't add inline imports halfway down a file.
- Don't lower the `--max-warnings 0` gate on `pnpm lint`.
- Don't fall back to `npm`/`yarn` — pnpm is pinned via `packageManager`.
