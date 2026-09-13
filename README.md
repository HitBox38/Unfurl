# Unfurl

Unfurl is a branching dialogue editor for game developers and narrative designers. Import stories from Twee, Obsidian Markdown notes, or Unfurl JSON, explore them as an interactive graph, and edit their dialogue, choices, and metadata. Export the result as JSON for use in your game.

The app runs on the desktop through Electron and in a browser.

[Get the desktop app](https://hit-box38.itch.io/unfurl) · [Report a bug or request a feature](https://github.com/HitBox38/Unfurl/issues)

## Features

- **Projects:** Organize story files into projects, each with its own metadata configuration.
- **Graph editing:** Visualize branching paths, add and remove nodes, and edit node content and choices.
- **Metadata:** Configure project fields and edit their values on individual nodes.
- **Undo and redo:** Step through story edits with toolbar controls or `Ctrl/Cmd+Z` and `Ctrl/Cmd+Shift+Z` when focus is outside text inputs.
- **Recent files:** Reopen stories from the sidebar or the home page.
- **Local persistence:** Keep projects and edits in the current browser or desktop app, and download stories as JSON.

## Supported formats

| Format | Import behavior | Export |
| --- | --- | --- |
| Twee (`.twee`) | Each file becomes a separate story. | Unfurl JSON |
| Obsidian Markdown (`.md`) | Notes selected or dropped together are combined into one story. A story title is required. | Unfurl JSON |
| Unfurl JSON (`.json`) | Each file becomes a separate story. Files must use Unfurl's story structure. | Unfurl JSON |

JSON stories contain a title, a starting node, and a list of nodes with content, choices, and metadata. See the [story types](src/shared/types/story-data.ts) and [node types](src/shared/types/node.ts) for the structure. To use an export in a game, load the JSON through your own dialogue system.

## Using Unfurl

1. Open the app and select a project, or choose **New project** to create one.
2. Import supported files using the file picker or drag and drop. When importing from the home page, choose the destination project if you have more than one.
3. Open a story to explore its graph and edit nodes, dialogue, choices, and metadata.
4. Use **Download** to export the edited story as JSON.

To try an existing story, choose **Try a sample** on the home page, or import the bundled [Lorcan02.1.twee sample](public/Lorcan02.1.twee).

### Where your work is saved

Projects and story edits are saved in `localStorage` for the current browser origin or desktop app. Importing a file creates a local editable copy; edits do not overwrite the original file on disk.

Storage is separate between browsers and the desktop app, and clearing app or browser data can remove saved work. Download JSON copies to back up stories or move them between environments. No account, backend service, or database setup is required.

## Development

### Prerequisites

- Node.js **22.12 or newer**.
- **pnpm 11.1.3**, pinned in `package.json`. Use pnpm for this repository.
- Git.

### Run locally

```sh
git clone https://github.com/HitBox38/Unfurl.git
cd Unfurl
pnpm install
pnpm dev
```

`pnpm dev` starts Vite and launches Electron with hot reload. The renderer is also available at the URL printed by Vite, normally `http://localhost:5173`.

### Preview in a browser

Build the app, then serve the renderer without launching Electron:

```sh
pnpm build
pnpm preview
```

Open the URL printed by the preview server. This is also useful in headless environments where Electron cannot open a window.

### Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start Vite and Electron in development mode. |
| `pnpm typecheck` | Check TypeScript project references with `tsc -b`. |
| `pnpm lint` | Run ESLint with zero warnings allowed. |
| `pnpm test` | Run the Vitest suite once. |
| `pnpm test:watch` | Run tests in watch mode. |
| `pnpm test:coverage` | Run tests with coverage output in `coverage/`. |
| `pnpm build` | Typecheck and build the renderer into `dist/` and Electron bundles into `dist-electron/`. |
| `pnpm preview` | Serve the built renderer in a browser. |
| `pnpm build:windows` | Build and package `release/Unfurl-Windows-Setup.exe`. |
| `pnpm build:mac` | Build and package `release/Unfurl-Mac-Installer.dmg`. |
| `pnpm build:linux` | Build and package `release/Unfurl-Linux.AppImage`. |

Packaging uses Electron Builder. Use the matching operating system for platform builds, as the repository's CI workflow does. Packaging scripts build locally without publishing.

### Releasing a new version

Update `version` in `package.json` before merging a release into `master`. On every push to `master`, the [release workflow](.github/workflows/release.yaml) checks and builds all three desktop installers, then publishes them to itch.io and [GitHub Releases](https://github.com/HitBox38/Unfurl/releases).

GitHub Releases use the package version as the tag (for example, `v2.0.1`), point to the built commit, and include automatically generated release notes plus the Windows `.exe`, macOS `.dmg`, and Linux `.AppImage` downloads. Versions containing a prerelease suffix are marked as prereleases.

An already published GitHub version is skipped; bump the package version to publish another release. Releases stay in draft until all three installers are uploaded, and rerunning the same commit can resume an interrupted draft. GitHub and itch.io publishing run independently after successful builds, so an itch.io upload failure does not block GitHub publishing. GitHub publishing uses the workflow's built-in `GITHUB_TOKEN`; itch.io continues to use the `ITCH_API_KEY` repository secret.

## Architecture

Unfurl uses React 19 and TypeScript 6 with Vite 8 and Electron 42. Zustand manages shared state, TanStack Router handles navigation, and React Flow (`@xyflow/react`) with Dagre powers the graph. The UI uses Tailwind CSS 4, shadcn/ui primitives, and Lucide icons. Tests use Vitest and Testing Library.

```text
src/
  app/          App shell, routes, and pages
  features/     Import, graph editing, projects, history, and other features
  shared/       Components, hooks, converters, storage, stores, types, and UI
  styles/       Theme tokens and global styles
  test/         Test setup and fixtures
electron/       Desktop main process and preload bridge
public/         Static assets and sample story
```

Story conversion and editing run locally. Storage helpers persist projects and stories, while the Electron main process and preload bridge provide desktop integration.

## Contributing

Use [GitHub issues](https://github.com/HitBox38/Unfurl/issues) for bugs and feature requests. For code changes, read [AGENTS.md](AGENTS.md) for repository conventions, feature organization, and Electron guidance.

Use `@/` imports across feature boundaries, follow the existing feature-folder layout, and place feature tests in their `__tests__/` folders. Keep generated build outputs out of commits.

Before opening a pull request, run all four checks:

```sh
pnpm lint
pnpm test
pnpm typecheck
pnpm build
```
