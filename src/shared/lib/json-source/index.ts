import { parser } from "@lezer/json";

import type { StoryPath } from "@/shared/lib/story-validation";

type SyntaxNode = ReturnType<typeof parser.parse>["topNode"];

export interface JsonRange {
  path: StoryPath;
  from: number;
  to: number;
  keyFrom?: number;
  keyTo?: number;
}

export const pathKey = (path: StoryPath) => JSON.stringify(path);

export const readJsonRanges = (source: string) => {
  const ranges = new Map<string, JsonRange>();
  const duplicates: JsonRange[] = [];
  const visit = (node: SyntaxNode, path: StoryPath, key?: SyntaxNode) => {
    const range: JsonRange = { path, from: node.from, to: node.to, keyFrom: key?.from, keyTo: key?.to };
    if (ranges.has(pathKey(path))) duplicates.push(range);
    ranges.set(pathKey(path), range);
    if (node.name === "Object") {
      for (let child = node.firstChild; child; child = child.nextSibling) {
        if (child.name !== "Property") continue;
        const property = child.getChild("PropertyName");
        const value = child.lastChild;
        if (!property || !value || value === property || value.name === ":") continue;
        try {
          const name: unknown = JSON.parse(source.slice(property.from, property.to));
          if (typeof name === "string") visit(value, [...path, name], property);
        } catch { /* Incomplete property names have no navigable path yet. */ }
      }
    } else if (node.name === "Array") {
      let index = 0;
      for (let child = node.firstChild; child; child = child.nextSibling) {
        if (["Object", "Array", "String", "Number", "True", "False", "Null"].includes(child.name)) visit(child, [...path, index++]);
      }
    }
  };
  const root = parser.parse(source).topNode.firstChild;
  if (root) visit(root, []);
  return { ranges, duplicates };
};

export const jsonRangeAtPath = (source: string, path: StoryPath) =>
  readJsonRanges(source).ranges.get(pathKey(path));
