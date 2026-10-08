import { pathKey, readJsonRanges } from "@/shared/lib/json-source";
import { nodeShapeIssues } from "@/shared/lib/story-validation";
import type {
  MetadataConfigTemplate,
  StoryData,
  StoryNode,
} from "@/shared/types";

import { mergeValues, valuesEqual } from "./merge";
import type {
  DraftResult,
  IdeIssue,
  IdeWorkspace,
  NodeDocument,
  StorySearch,
} from "./types";

export const emptySearch: StorySearch = {
  query: "",
  scope: "all",
  field: "",
  exact: false,
  caseSensitive: false,
};
export const serializeNode = (node: StoryNode) => JSON.stringify(node, null, 2);
const parsedDocuments = new WeakMap<
  NodeDocument,
  { text: string; result: { node: StoryNode | null; issues: IdeIssue[] } }
>();

export const createWorkspace = (
  fileId: string,
  story: StoryData,
): IdeWorkspace => {
  const documents = story.nodes.map((node, index) => ({
    id: `node:${index}:${node.name}`,
    originalName: node.name,
    lastName: node.name,
    text: serializeNode(node),
  }));
  return {
    version: 1,
    fileId,
    base: story,
    documents,
    tabs: documents[0] ? [documents[0].id] : [],
    activeId: documents[0]?.id ?? null,
    search: { ...emptySearch },
    lastValid: story,
    mode: "graph",
    resolutions: {},
  };
};

export const parseDocument = (
  document: NodeDocument,
): { node: StoryNode | null; issues: IdeIssue[] } => {
  const cached = parsedDocuments.get(document);
  if (cached?.text === document.text) return cached.result;
  const remember = (result: { node: StoryNode | null; issues: IdeIssue[] }) => {
    parsedDocuments.set(document, { text: document.text, result });
    return result;
  };
  const issue = (message: string): IdeIssue => ({
    documentId: document.id,
    path: [],
    severity: "error",
    message,
  });
  let value: unknown;
  try {
    value = JSON.parse(document.text);
  } catch (error) {
    return remember({
      node: null,
      issues: [issue(error instanceof Error ? error.message : "Invalid JSON.")],
    });
  }
  const issues: IdeIssue[] = nodeShapeIssues(value).map((entry) => ({
    ...entry,
    documentId: document.id,
    severity: "error",
  }));
  for (const duplicate of readJsonRanges(document.text).duplicates) {
    issues.push({
      documentId: document.id,
      path: duplicate.path,
      severity: "error",
      message: `Duplicate JSON property “${String(duplicate.path.at(-1))}”.`,
    });
  }
  return remember({
    node: issues.length ? null : (value as StoryNode),
    issues,
  });
};

export const workspaceHasChanges = (
  workspace: Pick<IdeWorkspace, "base" | "documents">,
) => {
  if (
    workspace.documents.some(
      (document) => document.originalName === null && !document.deleted,
    )
  )
    return true;
  const originalDocuments = workspace.documents.filter(
    (document) => document.originalName !== null,
  );
  if (originalDocuments.length !== workspace.base.nodes.length) return true;
  return originalDocuments.some((document, index) => {
    if (document.deleted) return true;
    const parsed = parseDocument(document);
    return (
      !parsed.node || !valuesEqual(parsed.node, workspace.base.nodes[index])
    );
  });
};

export const stageDocuments = (
  workspace: IdeWorkspace,
  documents: NodeDocument[],
): IdeWorkspace => {
  const renames = new Map<string, string>();
  const previousById = new Map(
    workspace.documents.map((document) => [document.id, document]),
  );
  const previousNameCounts = new Map<string, number>();
  for (const document of workspace.documents) {
    if (document.deleted) continue;
    const name = document.lastName ?? document.originalName;
    if (name)
      previousNameCounts.set(name, (previousNameCounts.get(name) ?? 0) + 1);
  }
  const parsedById = new Map(
    documents
      .filter((document) => !document.deleted)
      .map((document) => [document.id, parseDocument(document).node]),
  );
  const nextNameCounts = new Map<string, number>();
  for (const node of parsedById.values())
    if (node)
      nextNameCounts.set(node.name, (nextNameCounts.get(node.name) ?? 0) + 1);
  const nextDocuments = documents.map((document) => {
    const parsed = parsedById.get(document.id);
    const previous = previousById.get(document.id);
    const previousName =
      previous?.lastName ??
      (previous ? parseDocument(previous).node?.name : null) ??
      previous?.originalName;
    const unique = parsed && nextNameCounts.get(parsed.name) === 1;
    if (
      unique &&
      previousName &&
      parsed.name !== previousName &&
      previousNameCounts.get(previousName) === 1
    )
      renames.set(previousName, parsed.name);
    return unique && document.lastName !== parsed.name
      ? { ...document, lastName: parsed.name }
      : document;
  });
  if (!renames.size) return { ...workspace, documents: nextDocuments };
  return {
    ...workspace,
    documents: nextDocuments.map((document) => {
      if (document.deleted) return document;
      const previous = previousById.get(document.id);
      const beforeRanges = previous
        ? readJsonRanges(previous.text).ranges
        : new Map();
      const replacements: { from: number; to: number; text: string }[] = [];
      for (const range of readJsonRanges(document.text).ranges.values()) {
        if (range.path[0] !== "choices" || range.path.at(-1) !== "destination")
          continue;
        try {
          const value: unknown = JSON.parse(
            document.text.slice(range.from, range.to),
          );
          if (typeof value !== "string" || !renames.has(value)) continue;
          const oldRange = beforeRanges.get(pathKey(range.path));
          const oldValue: unknown =
            oldRange && previous
              ? JSON.parse(previous.text.slice(oldRange.from, oldRange.to))
              : value;
          if (value === oldValue)
            replacements.push({
              from: range.from,
              to: range.to,
              text: JSON.stringify(renames.get(value)),
            });
        } catch {
          /* A temporarily invalid destination stays available for manual repair. */
        }
      }
      let text = document.text;
      for (const replacement of replacements.sort((a, b) => b.from - a.from))
        text =
          text.slice(0, replacement.from) +
          replacement.text +
          text.slice(replacement.to);
      return text === document.text ? document : { ...document, text };
    }),
  };
};

export const evaluateDraft = (
  workspace: Pick<IdeWorkspace, "base" | "documents" | "resolutions">,
  saved: StoryData,
  metadataConfig?: MetadataConfigTemplate,
): DraftResult => {
  const result: DraftResult = {
    story: null,
    issues: [],
    conflicts: [],
    nodesByDocument: new Map(),
    mergedByDocument: new Map(),
    sourceByDocument: new Map(),
    savedByDocument: new Map(),
  };
  for (const document of workspace.documents) {
    if (document.deleted) continue;
    const { node, issues } = parseDocument(document);
    result.issues.push(...issues);
    if (node) result.nodesByDocument.set(document.id, node);
  }
  if (result.issues.length) return result;

  const originals = workspace.documents.filter(
    (document) => document.originalName !== null,
  );
  const baseById = new Map(
    originals.map((document, index) => [
      document.id,
      workspace.base.nodes[index],
    ]),
  );
  const savedById = result.savedByDocument;
  const savedCandidates = new Map<
    string,
    { node: StoryNode; index: number }[]
  >();
  saved.nodes.forEach((node, index) =>
    savedCandidates.set(node.name, [
      ...(savedCandidates.get(node.name) ?? []),
      { node, index },
    ]),
  );
  const usedSavedIndexes = new Set<number>();
  const savedIndexesById = new Map<string, number>();
  for (const document of originals) {
    const candidates = (
      savedCandidates.get(document.originalName!) ?? []
    ).filter(({ index }) => !usedSavedIndexes.has(index));
    const selected =
      candidates.find(({ node }) =>
        valuesEqual(node, baseById.get(document.id)),
      ) ?? candidates[0];
    if (selected) {
      usedSavedIndexes.add(selected.index);
      savedIndexesById.set(document.id, selected.index);
      savedById.set(document.id, selected.node);
    }
  }
  const nodesBySavedIndex = new Map<number, StoryNode>();
  const additions: StoryNode[] = [];
  for (const document of workspace.documents) {
    const draft = result.nodesByDocument.get(document.id);
    const original = baseById.get(document.id);
    const current = savedById.get(document.id);
    const value = mergeValues(original, current, draft, {
      documentId: document.id,
      nodeName: draft?.name ?? document.originalName ?? "New node",
      conflicts: result.conflicts,
      resolutions: workspace.resolutions,
    });
    if (value !== undefined) {
      const node = value as StoryNode;
      result.mergedByDocument.set(document.id, node);
      result.sourceByDocument.set(document.id, node);
      const savedIndex = savedIndexesById.get(document.id);
      if (savedIndex === undefined) additions.push(node);
      else nodesBySavedIndex.set(savedIndex, node);
    }
  }
  const mergedNodes = [
    ...saved.nodes.flatMap((node, index) =>
      usedSavedIndexes.has(index)
        ? nodesBySavedIndex.has(index)
          ? [nodesBySavedIndex.get(index)!]
          : []
        : [node],
    ),
    ...additions,
  ];
  const idsByNode = new Map(
    [...result.mergedByDocument].map(([id, node]) => [node, id]),
  );
  for (const node of mergedNodes)
    result.issues.push(
      ...nodeShapeIssues(node).map((issue) => ({
        ...issue,
        documentId: idsByNode.get(node) ?? null,
        severity: "error" as const,
      })),
    );
  if (result.issues.length) return result;
  const liveNames = new Set(mergedNodes.map((node) => node.name));
  const originalCounts = new Map<string, number>();
  for (const node of workspace.base.nodes)
    originalCounts.set(node.name, (originalCounts.get(node.name) ?? 0) + 1);
  const renames = new Map<string, string>();
  const removed = new Set<string>();
  for (const document of workspace.documents) {
    const node = result.mergedByDocument.get(document.id);
    if (document.deleted && !node) {
      if (document.originalName !== null) removed.add(document.originalName);
      if (document.lastName) removed.add(document.lastName);
    }
    if (
      node &&
      document.originalName !== null &&
      node.name !== document.originalName &&
      originalCounts.get(document.originalName) === 1
    )
      renames.set(document.originalName, node.name);
  }
  const story: StoryData = {
    ...saved,
    nodes: mergedNodes.map((node) => {
      const next = {
        ...node,
        choices: node.choices.flatMap((choice) => {
          if (
            removed.has(choice.destination) &&
            !liveNames.has(choice.destination)
          )
            return [];
          return [
            {
              ...choice,
              destination: !liveNames.has(choice.destination)
                ? (renames.get(choice.destination) ?? choice.destination)
                : choice.destination,
            },
          ];
        }),
      };
      const id = idsByNode.get(node);
      if (id) {
        result.mergedByDocument.set(id, next);
        idsByNode.set(next, id);
      }
      return next;
    }),
  };
  if (story.start !== null && !liveNames.has(story.start)) {
    if (renames.has(story.start)) story.start = renames.get(story.start)!;
    else if (removed.has(story.start))
      story.start = story.nodes[0]?.name ?? null;
  } else if (story.start === null) {
    const firstNew = workspace.documents.find(
      (document) => document.originalName === null && !document.deleted,
    );
    if (firstNew)
      story.start = result.mergedByDocument.get(firstNew.id)?.name ?? null;
  }
  const names = new Map<string, number>();
  const savedNameCounts = new Map<string, number>();
  for (const node of saved.nodes)
    savedNameCounts.set(node.name, (savedNameCounts.get(node.name) ?? 0) + 1);
  for (const node of story.nodes)
    names.set(node.name, (names.get(node.name) ?? 0) + 1);
  const definitions = new Map(
    metadataConfig?.config.map((field) => [field.name, field]),
  );
  for (const node of story.nodes) {
    const documentId = idsByNode.get(node) ?? null;
    const previous = documentId
      ? savedById.get(documentId)
      : saved.nodes.find((entry) => entry.name === node.name);
    if ((names.get(node.name) ?? 0) > 1)
      result.issues.push({
        documentId,
        path: ["name"],
        severity:
          (names.get(node.name) ?? 0) > (savedNameCounts.get(node.name) ?? 0)
            ? "error"
            : "warning",
        message: `Duplicate node name “${node.name}”.`,
      });
    node.choices.forEach((choice, index) => {
      if (names.has(choice.destination)) return;
      const existed = previous?.choices.some(
        (entry) => entry.destination === choice.destination,
      );
      result.issues.push({
        documentId,
        path: ["choices", index, "destination"],
        severity: existed ? "warning" : "error",
        message: `Destination “${choice.destination || "(empty)"}” does not exist.`,
      });
    });
    for (const [key, value] of Object.entries(node.metadata)) {
      const definition = definitions.get(key);
      if (definition && typeof value !== definition.type) {
        result.issues.push({
          documentId,
          path: ["metadata", key],
          severity: "error",
          message: `“${key}” requires a ${definition.type} value.`,
        });
      } else if (metadataConfig && !definition) {
        const existed = previous && Object.hasOwn(previous.metadata, key);
        result.issues.push({
          documentId,
          path: ["metadata", key],
          severity: existed ? "warning" : "error",
          message: `“${key}” has no project metadata definition. Use Metadata refactor to define it.`,
        });
      }
    }
  }
  if (story.start !== null && !names.has(story.start))
    result.issues.push({
      documentId: null,
      path: ["start"],
      severity: saved.start === story.start ? "warning" : "error",
      message: `Start node “${story.start}” does not exist.`,
    });
  result.story = story;
  return result;
};

export const canApplyDraft = (result: DraftResult) =>
  result.story !== null &&
  !result.conflicts.length &&
  !result.issues.some((issue) => issue.severity === "error");

export const rebaseWorkspace = (
  workspace: IdeWorkspace,
  saved: StoryData,
  result: DraftResult,
): IdeWorkspace => {
  if (
    !result.story ||
    result.conflicts.length ||
    valuesEqual(workspace.base, saved)
  )
    return workspace;
  const surviving: NodeDocument[] = [];
  for (const document of workspace.documents) {
    const source = result.sourceByDocument.get(document.id);
    const savedNode = result.savedByDocument.get(document.id);
    if (!source && !savedNode && document.originalName !== null) continue;
    surviving.push({
      ...document,
      originalName: savedNode ? savedNode.name : null,
      deleted: !source && (Boolean(savedNode) || Boolean(document.deleted)),
      text:
        source && !valuesEqual(source, parseDocument(document).node)
          ? serializeNode(source)
          : document.text,
      lastName: source?.name ?? document.lastName,
    });
  }
  const bySavedNode = new Map(
    surviving.flatMap((document) => {
      const savedNode = result.savedByDocument.get(document.id);
      return savedNode ? [[savedNode, document] as const] : [];
    }),
  );
  const reordered = saved.nodes.map(
    (node, index) =>
      bySavedNode.get(node) ?? {
        id: `saved:${index}:${crypto.randomUUID()}`,
        originalName: node.name,
        lastName: node.name,
        text: serializeNode(node),
      },
  );
  const documents = [
    ...reordered,
    ...surviving.filter((document) => document.originalName === null),
  ];
  const ids = new Set(documents.map((document) => document.id));
  const tabs = workspace.tabs.filter((id) => ids.has(id));
  return {
    ...workspace,
    base: saved,
    documents,
    tabs,
    activeId:
      workspace.activeId && ids.has(workspace.activeId)
        ? workspace.activeId
        : (tabs[0] ?? null),
    resolutions: {},
  };
};

export const draftChanges = (saved: StoryData, draft: StoryData) => {
  const group = (nodes: StoryNode[]) => {
    const groups = new Map<string, StoryNode[]>();
    for (const node of nodes) {
      const entries = groups.get(node.name);
      if (entries) entries.push(node);
      else groups.set(node.name, [node]);
    }
    return groups;
  };
  const savedGroups = group(saved.nodes);
  const draftGroups = group(draft.nodes);
  return [...new Set([...savedGroups.keys(), ...draftGroups.keys()])].flatMap(
    (name) => {
      const before = savedGroups.get(name) ?? [];
      const after = draftGroups.get(name) ?? [];
      // Match unchanged duplicates first so a changed sibling cannot disappear from review.
      const remaining = [...after];
      const changedBefore = before.filter((node) => {
        const match = remaining.findIndex((entry) => valuesEqual(node, entry));
        if (match === -1) return true;
        remaining.splice(match, 1);
        return false;
      });
      return Array.from(
        { length: Math.max(changedBefore.length, remaining.length) },
        (_, index) => ({
          name,
          key: `${name}:${index}`,
          before: changedBefore[index],
          after: remaining[index],
        }),
      );
    },
  );
};
