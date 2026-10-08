# Refactor metadata definitions at project level

Metadata definitions are shared by a project's stories and determine which
fields narrative designers see in the visual editor. Changing those definitions
uses an explicit project-wide refactor that previews and updates the definition
and affected nodes across stories together, with review and apply separate from
a story fix. We chose this over renaming keys only in the current story so a
technical correction does not leave stored metadata disconnected from its
authoring controls; correcting an existing field's value remains a story fix.
