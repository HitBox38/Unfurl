# Apply IDE fixes together

Technical collaborators investigate and correct problems that may span several
story nodes. IDE edits remain recoverable drafts until the collaborator reviews
and explicitly applies the complete fix; application updates the saved story
together and creates one undoable action. We chose this over independent node
saves or automatic saving of valid edits so that intermediate edits do not leave
a technical fix partially applied.

While a fix is pending, the graph previews the draft with editing disabled so
visual edits cannot bypass the apply boundary. If the draft becomes temporarily
invalid, the graph retains the last valid preview and labels it as out of date.

Recovering a draft after the saved story changes merges independent edits and
requires explicit resolution of overlapping edits using the original, saved,
and draft values. The combined result is revalidated before application so
recoverable drafts can coexist with later edits to the saved story.
