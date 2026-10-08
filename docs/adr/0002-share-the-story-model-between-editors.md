# Share the story model between editors

The IDE's editable node JSON and the visual editor use one shared, validated
story model. Game-specific additions must explicitly extend that model rather
than introduce arbitrary JSON that only the IDE understands. We chose this
boundary so technical fixes remain intact and understandable when a narrative
designer resumes visual editing, accepting the additional work of extending the
shared model when a game requires new kinds of data.

Validation evaluates the combined pending changes. Malformed JSON, invalid
field types, and newly introduced duplicate node names or broken links prevent
application. Existing unresolved links remain visible as warnings so an
unrelated technical fix does not require completing an unfinished story.
