# Unfurl Product Hunt launch kit

Saved draft: https://www.producthunt.com/products/unfurl-2?launch=unfurl-2

The launch is a draft and is not scheduled. The five gallery images, copy, tags, and shoutouts below were saved and verified on the draft page.

## Gallery order

1. `01-cover.png` — Write branching dialogue for your game.
2. `02-edit.png` — Edit a choice. See where it leads.
3. `03-import.png` — Bring your existing stories.
4. `04-export.png` — Export dialogue as JSON.
5. `05-try-sample.png` — Try a story. No signup needed.

The existing logo thumbnail was retained. `draft-preview.png` is a real screenshot of the saved Product Hunt draft. `reference-editor.png` is a real screenshot of the locally running editor.

## Provenance and generation brief

The gallery was created with the built-in image-generation tool, using screenshots of the running app and its actual exported JSON as references. These are composed marketing images, not untouched application screenshots. The demo story is provided as `The-Lantern-Gate.twee` and the actual app export as `The-Lantern-Gate.json`.

Shared visual brief: wide landscape slides, near-black background, crisp white typography, restrained violet accents, generous margins, one clear message per slide, readable product detail, no invented metrics or unsupported integrations.

Prompt summaries:

- Cover: show the six-node Lantern Gate graph, the headline above, “Every choice. Clearly connected.” and Free / Open source / No account. Arrival connects to Ask for help and Go alone; Ask for help connects to An ally and A bargain; Go alone connects to A new path.
- Editing: show Ask for help selected and its content and two choice destinations in the editor. Preserve real choice wording and make the edit workflow understandable at gallery size.
- Import: pair the abbreviated real Twee excerpt with the corresponding six-node graph. Name Twee, Obsidian Markdown, and Unfurl JSON as imports. The final image was refined to match the actual choice text.
- Export: pair the selected graph node with a readable excerpt from the app’s actual JSON export. Subtitle: “Your dialogue and choices, ready for your game’s integration.” Do not imply automatic Unity integration.
- Try sample: use the built-in Lorcan story as the UI reference, a clear Try a sample callout, and unfurl.ink. Emphasize that no account is needed.

## Saved copy

Tagline: Write and edit branching game dialogue visually

Description:

See how every dialogue choice connects. Unfurl is a free, open-source editor for narrative designers and game developers. Import Twee, Obsidian Markdown, or Unfurl JSON; edit dialogue and choices on a visual graph; then export JSON for your game. Work in your browser or on desktop, with local storage and no account. Open the sample to try it.

First comment:

Hey Product Hunt, I’m Tomer 👋

I built Unfurl while working on Dullahan Dandi with a five-person university team. Our dialogue lived in Twee and Markdown files, and following the branches meant scrolling through text.

We used Unfurl to author the game’s dialogue visually, then exported JSON for our Unity integration.

It’s free, open source, and runs in your browser or on desktop. No account needed.

Try it at https://unfurl.ink: click “Try a sample,” open a node, and edit a choice.

If you write branching dialogue, what’s hardest in your current workflow: following branches, revising choices, or getting it into your game?

Tags: Design Tools, Developer Tools, Writing. Pricing: Free. Open source selected. Maker: Tomer Norman.

## Saved shoutouts

Vercel: Vercel hosts Unfurl’s browser version at unfurl.ink, so writers can open a sample and start exploring dialogue without installing the desktop app.

shadcn/ui: Unfurl uses shadcn/ui primitives for its dialogs, inputs, and controls. Having the component source in the app makes it possible to keep the editor’s interface consistent with its own theme.

GitHub: GitHub is where Unfurl’s source and development history live. It gives people trying the editor a direct way to inspect the code, report issues, and contribute improvements.

## Demo video — still to record

No video was recorded or uploaded. QuickTime’s New Screen Recording command was disabled, and the macOS Screenshot tool did not open successfully. Product Hunt’s video field remains empty; it accepts a YouTube or Loom link.

Record roughly 40 seconds of the actual app, with captions and no long introduction:

| Time | Show | Caption / narration |
| --- | --- | --- |
| 0–5s | Lantern Gate graph, all six nodes visible | Write branching dialogue for your game. |
| 5–15s | Open Ask for help; edit a choice; show its destination | Edit the dialogue, choices, and where each choice leads. |
| 15–23s | Save the node and show the connected graph | See how your story fits together. |
| 23–31s | Click Export JSON and show the real exported file | Export dialogue and choices for your game’s integration. |
| 31–40s | Home page; point to Try a sample, then open it | Free. Open source. No account. Try a story at unfurl.ink. |

Use the sample files in this folder. Capture only the app area, keep the cursor deliberate, and verify the exported JSON shown is the real output. Hosting destination was not selected.

## Validation

`pnpm build:web` succeeded (existing bundle-size warning). Ran the built renderer locally, imported the sample Twee story, opened its nodes and choices, and exported the included JSON through the app. No application source changes were made for this launch kit.
