import { autocompletion } from "@codemirror/autocomplete";
import { json, jsonParseLinter } from "@codemirror/lang-json";
import {
  forceLinting,
  linter,
  lintGutter,
  type Diagnostic,
} from "@codemirror/lint";
import { Annotation, EditorState, Transaction } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { basicSetup } from "codemirror";
import { useEffect, useLayoutEffect, useRef } from "react";

import { jsonRangeAtPath } from "@/shared/lib/json-source";
import { createCompletionSource } from "@/features/story-ide/components/json-node-editor/completions";
import {
  editorTheme,
  highlights,
} from "@/features/story-ide/components/json-node-editor/theme";
import type { JsonNodeEditorProps } from "@/features/story-ide/components/json-node-editor/types";

const externalSource = Annotation.define<boolean>();
export const useJsonNodeEditor = (props: JsonNodeEditorProps) => {
  const parentRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const propsRef = useRef(props);
  const statesRef = useRef(new Map<string, EditorState>());
  const documentId = props.document.id;

  useLayoutEffect(() => {
    propsRef.current = props;
  });

  useEffect(() => {
    const parent = parentRef.current;
    if (!parent) return;
    const storedStates = statesRef.current;
    const complete = createCompletionSource(() => propsRef.current);
    const diagnostics = (view: EditorView): Diagnostic[] => {
      const syntax = jsonParseLinter()(view);
      if (syntax.length) return syntax;
      return propsRef.current.issues.map((issue) => {
        const range = jsonRangeAtPath(view.state.doc.toString(), issue.path);
        return {
          from: range?.from ?? 0,
          to: range?.to ?? Math.min(1, view.state.doc.length),
          severity: issue.severity,
          message: issue.message,
        };
      });
    };
    const extensions = [
      basicSetup,
      json(),
      editorTheme,
      highlights,
      EditorState.tabSize.of(2),
      EditorView.contentAttributes.of({
        "aria-label": "Node JSON editor",
        "aria-multiline": "true",
        spellcheck: "false",
      }),
      autocompletion({ override: [complete] }),
      lintGutter(),
      linter(diagnostics, { delay: 150 }),
      EditorView.updateListener.of((update) => {
        if (
          update.docChanged &&
          !update.transactions.some((transaction) =>
            transaction.annotation(externalSource),
          )
        )
          propsRef.current.onChange(update.state.doc.toString());
      }),
    ];
    let state =
      storedStates.get(documentId) ??
      EditorState.create({ doc: propsRef.current.document.text, extensions });
    const text = propsRef.current.document.text;
    if (state.doc.toString() !== text)
      state = state.update({
        changes: { from: 0, to: state.doc.length, insert: text },
        annotations: [
          Transaction.addToHistory.of(false),
          externalSource.of(true),
        ],
      }).state;
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
    while (
      from < before.length &&
      from < after.length &&
      before[from] === after[from]
    )
      from++;
    let end = 0;
    while (
      end < before.length - from &&
      end < after.length - from &&
      before[before.length - end - 1] === after[after.length - end - 1]
    )
      end++;
    view.dispatch({
      changes: {
        from,
        to: before.length - end,
        insert: after.slice(from, after.length - end),
      },
      annotations: [
        Transaction.addToHistory.of(false),
        externalSource.of(true),
      ],
    });
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
    const from = location.key ? (range.keyFrom ?? range.from) : range.from;
    const to = location.key ? (range.keyTo ?? range.to) : range.to;
    view.dispatch({
      selection: { anchor: from, head: to },
      effects: EditorView.scrollIntoView(from, { y: "center" }),
    });
    view.focus();
  }, [documentId, props.location]);

  return parentRef;
};
