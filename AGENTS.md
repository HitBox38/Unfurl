# Agents

## Cursor Cloud specific instructions

Unfurl is a client-side dialog/story file editor (React + Vite + Electron). No databases or backend services are required.

### Running the app

- `npm run dev` starts both the Vite dev server (web) and an Electron window. In headless/cloud environments, the Electron process will emit GPU/D-Bus errors but the Vite web server still serves the app at `http://localhost:5173/`.
- `npm run build` runs `tsc && vite build` (type-check then bundle).
- `npm run lint` runs ESLint on `src/`. The codebase has 2 pre-existing warnings (`react-hooks/exhaustive-deps`); `--max-warnings 0` causes a non-zero exit.

### Testing

There are no automated test suites in this project. Verify changes by running `npx tsc --noEmit` (type-check) and `npm run lint` (linting). For UI changes, run `npm run dev` and manually test in the browser.

### Sample data

`public/Lorcan02.1.twee` is a sample Twee dialog file that can be imported via the app's upload UI to verify the graph editor works end-to-end.
