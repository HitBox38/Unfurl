# unfurl-modernization orchestrate workspace

This directory is the `/orchestrate` workspace for the unfurl modernization run. It mirrors what the orchestrate skill at `cursor-public/skills/orchestrate/` expects under `<repo>/.orchestrate/<rootSlug>/`.

## Status

**Blocked: `CURSOR_API_KEY` not set in the cloud-agent VM.**

The planner cloud agent (id `bc-3b9d9507-305e-400b-a753-6fa267456541`) prepared `plan.json` and `state.json` here, but cannot call `bun cli.ts run --root .` because the orchestrate scripts require a personal/user Cursor API key to spawn child cloud agents via `@cursor/sdk`. The SDK call fails with:

```
CURSOR_API_KEY required; see cursor-sdk/references/auth.md
```

## How to resume

1. Create a personal Cursor API key at <https://cursor.com/dashboard/integrations>.
2. Add it as `CURSOR_API_KEY` in **Cursor Dashboard → Cloud Agents → Secrets** (or export it locally if you want to drive the loop from your own machine).
3. Install bun if needed: `curl -fsSL https://bun.sh/install | bash`.
4. Run the loop from anywhere with the secret set:

```bash
cd <path-to>/cursor-public/skills/orchestrate/scripts
bun install
bun cli.ts run --root <repo>/.orchestrate/unfurl-modernization
```

The committed `state.json` keeps both tasks `pending`, so the loop will spawn them on the next run and pick up from there.

## Task tree

- `modernize-unfurl` (worker, `openPR: true`) — the full modernization on `orch/unfurl-modernization/modernize-unfurl`:
  1. npm → pnpm (lockfile, scripts, workflows, docker)
  2. Vite + Electron + every other dep bumped to latest (skipping MUI/emotion/tss-react, which are removed in step 4); `reactflow` swapped for `@xyflow/react`
  3. Tailwind v4 + shadcn/ui init with `@/` alias and the components the UI needs
  4. MUI/`tss-react` removal — every component re-implemented with shadcn + Tailwind + lucide
  5. Feature-based folder restructure (`src/{app,features,shared,assets,styles}`)
  6. Vitest + Testing Library with ≥ 12 meaningful tests
  7. `AGENTS.md` written/updated with the new commands and layout
- `verify-modernization` (verifier, `verifies: modernize-unfurl`) — runs lint/test/typecheck/build, greps for leftover MUI/`tss-react`/`reactflow`, and exercises the dev UI to confirm the file-upload + FAQ flow still works.

## Why one big worker?

The user's goal touches every file that exists today (every component uses MUI, every file path moves under the new layout, every script/workflow references npm). Splitting into parallel siblings would force constant merge conflicts on `package.json`, the lockfile, and the component tree. Defaulting to one broad worker (as `references/planner.md` advises) keeps the migration atomic and lets the verifier check the end state.
