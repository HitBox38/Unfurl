# Optional story IDE

## User and purpose

The primary IDE user is a technical collaborator who occasionally steps into a
story authored by a narrative designer to correct its interaction with game
systems. Their workflow is to find affected nodes, understand their connections,
make consistent corrections, and return the story to the narrative designer.
Examples include correcting reward metadata, repairing choice destinations, and
editing game commands embedded in narrative content.

## Workspace

A story-level Graph / IDE switch provides dedicated views. The IDE has a node
explorer, story-wide search results, tabs for individual nodes, and a small graph
preview visible alongside the editor. Switching views preserves the selected
node, open tabs, search, and pending fix.

Each node tab exposes editable JSON with validation and field suggestions.
Both editors use the same supported story model; game-specific additions
explicitly extend that model.

## Investigation and editing

Search supports free text and field filters, such as finding nodes whose
metadata field `reward` equals `100`. Results lead to the relevant field or line
in a node tab. Multiple tabs support comparison between nodes. Bulk replacements
use the same filters and are previewed before joining the pending fix.

Edits remain recoverable drafts across tabs. The collaborator reviews and
explicitly applies the complete fix together as one undoable action.

If the saved story changes while a draft is pending, independent changes merge.
Overlapping edits require explicit resolution, showing the original, saved, and
draft values. The combined result is revalidated before application; unresolved
conflicts prevent applying the fix.

The graph previews the pending fix with editing disabled. If the draft is
temporarily invalid, the last valid preview remains visible and is clearly
marked as out of date.

## Validation and verification

Validation evaluates the combined pending changes. Malformed JSON, invalid
field types, and newly introduced duplicate node names or broken links block
application. Existing unresolved links remain visible as warnings so an
unrelated correction does not require completing an unfinished story.

Unfurl provides structural diagnostics and change review. Actual game behavior
is verified in the game's own tools; passing Unfurl's checks does not establish
that a reward value or embedded command is correct for the game.

An explicit "Export test copy" action validates and exports the combined pending
fix for testing in the game before application. It leaves the saved story
unchanged. Ordinary exports continue to use the saved story.

## Metadata definitions

Correcting an existing metadata value is part of a story fix. Changing project
metadata definitions uses a separate project-wide refactor, with a preview of
the definition and affected nodes across stories and an explicit review and
apply action.

## Using the implemented IDE

Open a saved story and choose **IDE** in the story toolbar. Select a node in the
explorer or the small graph preview to open its JSON tab. Search can target
narrative content, destinations, or a particular metadata field; **Exact value**
limits the query to a complete value. **Preview replacements** shows each
affected field before **Stage replacements** adds them to the pending fix.

Use **Export test copy** to test a validated fix in the game, then choose
**Review fix → Apply complete fix** to save it. File history undoes or redoes the
whole application. **Discard fix** returns to the latest saved story. Drafts,
tabs, search filters, and the chosen view are recovered from this browser's
local storage when reopening the story.
Only pending fixes retain a full recovery workspace; a clean story stores its
view preferences separately. Deleting a story also removes its recovery data.

**Metadata refactor** reviews definitions and saved values across the current
project. Type changes require matching values or an explicit binary conversion.
**Undo last refactor** restores the project only if subsequent saved edits would
not be overwritten. Pending story edits reconcile against the resulting saved
story and may require conflict resolution.
Metadata undo snapshots expire after seven days and are limited to 512 KB per
project. The review indicates when a refactor exceeds that limit and needs an
exported backup instead of retained undo.

## Related decisions

- [Apply IDE fixes together](./adr/0001-apply-ide-fixes-together.md)
- [Share the story model between editors](./adr/0002-share-the-story-model-between-editors.md)
- [Refactor metadata definitions at project level](./adr/0003-refactor-metadata-definitions-at-project-level.md)
