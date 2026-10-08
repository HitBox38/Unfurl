import { readJsonRanges } from "@/shared/lib/json-source";
import { isRecord, type StoryPath } from "@/shared/lib/story-validation";

import type { NodeDocument, SearchMatch, StorySearch } from "./types";

export const displayPath = (path: StoryPath) => path.reduce<string>((label, entry) =>
  typeof entry === "number" ? `${label}[${entry}]` : `${label ? `${label}.` : ""}${entry}`, "") || "Node";

const valueAtPath = (value: unknown, path: StoryPath): unknown => path.reduce<unknown>((entry, part) =>
  Array.isArray(entry) && typeof part === "number" ? entry[part] : isRecord(entry) ? entry[String(part)] : undefined, value);

const matchesValue = (value: string | number | boolean, search: StorySearch) => {
  const haystack = search.caseSensitive ? String(value) : String(value).toLocaleLowerCase();
  const needle = search.caseSensitive ? search.query : search.query.toLocaleLowerCase();
  return search.exact ? haystack === needle : haystack.includes(needle);
};

const matchesScope = (path: StoryPath, search: StorySearch) => {
  if (search.scope === "all") return true;
  if (search.scope === "destination") return path[0] === "choices" && path.at(-1) === "destination";
  if (search.scope === "metadata") return path[0] === "metadata" && (!search.field || path[1] === search.field);
  return path[0] === search.scope;
};

export const searchDocuments = (documents: NodeDocument[], search: StorySearch): SearchMatch[] => {
  if (!search.query && !(search.scope === "metadata" && search.field)) return [];
  const matches: SearchMatch[] = [];
  for (const document of documents) {
    if (document.deleted) continue;
    let value: unknown;
    try { value = JSON.parse(document.text); } catch { continue; }
    const nodeName = isRecord(value) && typeof value.name === "string" ? value.name : document.originalName ?? "New node";
    const { ranges } = readJsonRanges(document.text);
    for (const range of ranges.values()) {
      if (!matchesScope(range.path, search)) continue;
      const entry = valueAtPath(value, range.path);
      if ((typeof entry === "string" || typeof entry === "number" || typeof entry === "boolean") && (!search.query || matchesValue(entry, search))) {
        matches.push({ documentId: document.id, nodeName, path: range.path, value: entry, from: range.from, to: range.to });
      }
      if (search.query && range.keyFrom !== undefined && range.keyTo !== undefined && search.scope === "all") {
        const key = range.path.at(-1);
        if (typeof key === "string" && matchesValue(key, search)) matches.push({ documentId: document.id, nodeName, path: range.path, value: key, from: range.keyFrom, to: range.keyTo, key: true });
      }
    }
  }
  return matches;
};

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export interface ReplacementChange {
  match: SearchMatch;
  next: string | number | boolean;
}

export const previewReplacement = (
  documents: NodeDocument[], search: StorySearch, matches: SearchMatch[], replacement: string,
) => {
  const changes: ReplacementChange[] = [];
  const errors: string[] = [];
  for (const match of matches) {
    let next: string | number | boolean;
    if (typeof match.value === "string") {
      next = search.exact || !search.query ? replacement : match.value.replace(new RegExp(escapeRegExp(search.query), search.caseSensitive ? "g" : "gi"), () => replacement);
    } else {
      let parsed: unknown;
      try { parsed = JSON.parse(replacement); } catch { parsed = undefined; }
      if (typeof parsed !== typeof match.value || (typeof parsed === "number" && !Number.isFinite(parsed))) {
        errors.push(`${match.nodeName} · ${displayPath(match.path)} requires a ${typeof match.value} replacement.`);
        continue;
      }
      next = parsed as number | boolean;
    }
    if (next !== match.value) changes.push({ match, next });
  }
  const nextDocuments = documents.map((document) => {
    let text = document.text;
    for (const change of changes.filter((entry) => entry.match.documentId === document.id).sort((a, b) => b.match.from - a.match.from)) {
      text = text.slice(0, change.match.from) + JSON.stringify(change.next) + text.slice(change.match.to);
    }
    return text === document.text ? document : { ...document, text };
  });
  return { documents: nextDocuments, changes, errors };
};
