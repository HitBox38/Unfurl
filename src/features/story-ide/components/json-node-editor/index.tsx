import { autocompletion, type CompletionSource } from "@codemirror/autocomplete";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { forceLinting, linter, lintGutter, type Diagnostic } from "@codemirror/lint";
import { Annotation, EditorState, Transaction } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { parser } from "@lezer/json";
import { tags } from "@lezer/highlight";
import { basicSetup } from "codemirror";
import { useEffect, useLayoutEffect, useRef } from "react";

import { jsonRangeAtPath } from "@/shared/lib/json-source";
import type { MetadataField } from "@/shared/types/metadata-config-template";
import type { EditorLocation, IdeIssue, NodeDocument } from "@/features/story-ide/types";

interface JsonNodeEditorProps {
  document: NodeDocument;
  nodeNames: string[];
  fields: MetadataField[];
  issues: IdeIssue[];
  location: EditorLocation | null;
  onChange: (text: string) => void;
}

const defaults: Record<string, string> = {
  name: '"New node"', content: "[]", choices: "[]", metadata: "{}",
  position: '{"x": 0, "y": 0}', size: '{"width": 180, "height": 60}',
  text: '""', destination: '""', x: "0", y: "0", width: "180", height: "60",
};
const externalSource = Annotation.define<boolean>();

const editorTheme = EditorView.theme({
  "&": { height: "100%", backgroundColor: "var(--card)", color: "var(--foreground)", fontSize: "13px" },
  ".cm-scroller": { overflow: "auto", fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace", lineHeight: "1.7" },
  ".cm-content": { padding: "16px 0" },
  ".cm-gutters": { backgroundColor: "var(--card)", color: "var(--muted-foreground)", borderColor: "var(--border)" },
  ".cm-activeLine, .cm-activeLineGutter": { backgroundColor: "color-mix(in oklch, var(--chart-2) 8%, transparent)" },
  ".cm-cursor": { borderLeftColor: "var(--foreground)" },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": { backgroundColor: "color-mix(in oklch, var(--chart-2) 25%, transparent)" },
  ".cm-tooltip": { backgroundColor: "var(--popover)", color: "var(--popover-foreground)", borderColor: "var(--border)" },
  ".cm-tooltip-autocomplete ul li[aria-selected]": { backgroundColor: "var(--accent)", color: "var(--accent-foreground)" },
  ".cm-panels": { backgroundColor: "var(--card)", color: "var(--foreground)" },
  ".cm-textfield": { backgroundColor: "var(--background)", color: "var(--foreground)", borderColor: "var(--border)" },
  ".cm-button": { background: "var(--secondary)", color: "var(--foreground)", borderColor: "var(--border)" },
});

const highlights = syntaxHighlighting(HighlightStyle.define([
  { tag: tags.propertyName, color: "var(--chart-2)" },
  { tag: tags.string, color: "var(--foreground)" },
  { tag: [tags.number, tags.bool, tags.null], color: "var(--info)" },
]));

export const JsonNodeEditor = (props: JsonNodeEditorProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const propsRef = useRef(props);
  const statesRef = useRef(new Map<string, EditorState>());
  const documentId = props.document.id;

  useLayoutEffect(() => { propsRef.current = props; });

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;
    const storedStates = statesRef.current;
    const complete: CompletionSource = (context) => {
      const source = context.state.doc.toString();
      const tree = parser.parse(source);
      const token = tree.resolveInner(context.pos, -1);
      let object = token;
      while (object.parent && object.name !== "Object") object = object.parent;
      let property = token;
      while (property.parent && property.name !== "Property") property = property.parent;
      const key = property.name === "Property" ? property.getChild("PropertyName") : null;
      let propertyName = "";
      try { if (key) propertyName = JSON.parse(source.slice(key.from, key.to)); } catch { /* A partly typed key uses the containing object's suggestions. */ }
      const isValue = key && context.pos > key.to;
      const quoted = context.matchBefore(/"[^"\n]*"?$/);
      const word = context.matchBefore(/[\w-]*$/);
      if (!quoted && !context.explicit && (!word || !word.text)) return null;
      const from = quoted?.from ?? word?.from ?? context.pos;
      const to = token.name === "PropertyName" || token.name === "String" ? Math.max(context.pos, token.to) : context.pos;
      let objectField = "";
      if (object.parent?.name === "Property") {
        const objectKey = object.parent.getChild("PropertyName");
        try { if (objectKey) objectField = JSON.parse(source.slice(objectKey.from, objectKey.to)); } catch { /* Root fields remain available while JSON is incomplete. */ }
      }
      if (isValue) {
        if (propertyName === "destination") return {
          from, to, options: propsRef.current.nodeNames.map((name) => ({ label: JSON.stringify(name), type: "variable", detail: "node", apply: JSON.stringify(name) })),
        };
        const type = objectField === "metadata" ? propsRef.current.fields.find((field) => field.name === propertyName)?.type : ["position", "size"].includes(objectField) ? "number" : undefined;
        if (type === "boolean") return { from, to, options: [{ label: "true", type: "keyword" }, { label: "false", type: "keyword" }] };
        if (type === "number") return { from, to, options: [{ label: "0", type: "constant" }] };
        return null;
      }
      let names = ["name", "content", "choices", "metadata", "position", "size"];
      if (objectField === "metadata") names = propsRef.current.fields.map((field) => field.name);
      else if (objectField === "position") names = ["x", "y"];
      else if (objectField === "size") names = ["width", "height"];
      else if (object.parent?.name === "Array") names = ["text", "destination"];
      return {
        from, to,
        options: names.map((name) => {
          const field = objectField === "metadata" ? propsRef.current.fields.find((entry) => entry.name === name) : undefined;
          const hasColon = source.slice(to).trimStart().startsWith(":");
          return { label: JSON.stringify(name), detail: field?.type ?? "field", type: "property", apply: `${JSON.stringify(name)}${hasColon ? "" : `: ${field ? field.type === "number" ? "0" : "false" : defaults[name] ?? "null"}`}` };
        }),
      };
    };
    const diagnostics = (view: EditorView): Diagnostic[] => {
      const syntax = jsonParseLinter()(view);
      if (syntax.length) return syntax;
      return propsRef.current.issues.map((issue) => {
        const range = jsonRangeAtPath(view.state.doc.toString(), issue.path);
        return { from: range?.from ?? 0, to: range?.to ?? Math.min(1, view.state.doc.length), severity: issue.severity, message: issue.message };
      });
    };
    const extensions = [
      basicSetup, json(), editorTheme, highlights, EditorState.tabSize.of(2),
      EditorView.contentAttributes.of({ "aria-label": "Node JSON editor", "aria-multiline": "true", spellcheck: "false" }),
      autocompletion({ override: [complete] }), lintGutter(), linter(diagnostics, { delay: 150 }),
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !update.transactions.some((transaction) => transaction.annotation(externalSource))) propsRef.current.onChange(update.state.doc.toString());
      }),
    ];
    let state = storedStates.get(documentId) ?? EditorState.create({ doc: propsRef.current.document.text, extensions });
    const text = propsRef.current.document.text;
    if (state.doc.toString() !== text) state = state.update({ changes: { from: 0, to: state.doc.length, insert: text }, annotations: [Transaction.addToHistory.of(false), externalSource.of(true)] }).state;
    const view = new EditorView({ state, parent });
    viewRef.current = view;
    return () => {
      storedStates.set(documentId, view.state);
      view.destroy();
      viewRef.current = null;
    };
  }, [documentId]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view || view.state.doc.toString() === props.document.text) return;
    const before = view.state.doc.toString();
    const after = props.document.text;
    let from = 0;
    while (from < before.length && from < after.length && before[from] === after[from]) from++;
    let end = 0;
    while (end < before.length - from && end < after.length - from && before[before.length - end - 1] === after[after.length - end - 1]) end++;
    view.dispatch({ changes: { from, to: before.length - end, insert: after.slice(from, after.length - end) }, annotations: [Transaction.addToHistory.of(false), externalSource.of(true)] });
  }, [props.document.text]);

  useEffect(() => {
    if (viewRef.current) forceLinting(viewRef.current);
  }, [props.issues]);

  useEffect(() => {
    const view = viewRef.current;
    const location = props.location;
    if (!view || !location || location.documentId !== documentId) return;
    const range = jsonRangeAtPath(view.state.doc.toString(), location.path);
    if (!range) return;
    const from = location.key ? range.keyFrom ?? range.from : range.from;
    const to = location.key ? range.keyTo ?? range.to : range.to;
    view.dispatch({ selection: { anchor: from, head: to }, effects: EditorView.scrollIntoView(from, { y: "center" }) });
    view.focus();
  }, [documentId, props.location]);

  return <div ref={parentRef} className="ide-code-editor h-full min-h-0 min-w-0" />;
};
