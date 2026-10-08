import type { CompletionSource } from "@codemirror/autocomplete";
import { parser } from "@lezer/json";

import type { JsonNodeEditorProps } from "@/features/story-ide/components/json-node-editor/types";

const defaults: Record<string, string> = {
  name: '"New node"',
  content: "[]",
  choices: "[]",
  metadata: "{}",
  position: '{"x": 0, "y": 0}',
  size: '{"width": 180, "height": 60}',
  text: '""',
  destination: '""',
  x: "0",
  y: "0",
  width: "180",
  height: "60",
};
export const createCompletionSource =
  (
    getProps: () => Pick<JsonNodeEditorProps, "nodeNames" | "fields">,
  ): CompletionSource =>
  (context) => {
    const source = context.state.doc.toString();
    const tree = parser.parse(source);
    const token = tree.resolveInner(context.pos, -1);
    let object = token;
    while (object.parent && object.name !== "Object") object = object.parent;
    let property = token;
    while (property.parent && property.name !== "Property")
      property = property.parent;
    const key =
      property.name === "Property" ? property.getChild("PropertyName") : null;
    let propertyName = "";
    try {
      if (key) propertyName = JSON.parse(source.slice(key.from, key.to));
    } catch {
      /* A partly typed key uses the containing object's suggestions. */
    }
    const isValue = key && context.pos > key.to;
    const quoted = context.matchBefore(/"[^"\n]*"?$/);
    const word = context.matchBefore(/[\w-]*$/);
    if (!quoted && !context.explicit && (!word || !word.text)) return null;
    const from = quoted?.from ?? word?.from ?? context.pos;
    const to =
      token.name === "PropertyName" || token.name === "String"
        ? Math.max(context.pos, token.to)
        : context.pos;
    let objectField = "";
    if (object.parent?.name === "Property") {
      const objectKey = object.parent.getChild("PropertyName");
      try {
        if (objectKey)
          objectField = JSON.parse(source.slice(objectKey.from, objectKey.to));
      } catch {
        /* Root fields remain available while JSON is incomplete. */
      }
    }
    if (isValue) {
      if (propertyName === "destination")
        return {
          from,
          to,
          options: getProps().nodeNames.map((name) => ({
            label: JSON.stringify(name),
            type: "variable",
            detail: "node",
            apply: JSON.stringify(name),
          })),
        };
      const type =
        objectField === "metadata"
          ? getProps().fields.find((field) => field.name === propertyName)?.type
          : ["position", "size"].includes(objectField)
            ? "number"
            : undefined;
      if (type === "boolean")
        return {
          from,
          to,
          options: [
            { label: "true", type: "keyword" },
            { label: "false", type: "keyword" },
          ],
        };
      if (type === "number")
        return { from, to, options: [{ label: "0", type: "constant" }] };
      return null;
    }
    let names = ["name", "content", "choices", "metadata", "position", "size"];
    if (objectField === "metadata")
      names = getProps().fields.map((field) => field.name);
    else if (objectField === "position") names = ["x", "y"];
    else if (objectField === "size") names = ["width", "height"];
    else if (object.parent?.name === "Array") names = ["text", "destination"];
    return {
      from,
      to,
      options: names.map((name) => {
        const field =
          objectField === "metadata"
            ? getProps().fields.find((entry) => entry.name === name)
            : undefined;
        const hasColon = source.slice(to).trimStart().startsWith(":");
        return {
          label: JSON.stringify(name),
          detail: field?.type ?? "field",
          type: "property",
          apply: `${JSON.stringify(name)}${hasColon ? "" : `: ${field ? (field.type === "number" ? "0" : "false") : (defaults[name] ?? "null")}`}`,
        };
      }),
    };
  };
