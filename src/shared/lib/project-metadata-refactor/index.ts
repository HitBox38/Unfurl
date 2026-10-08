import {
  EDITABLE_FILES_STORAGE_KEY,
  listEditableFiles,
  listEditableFilesByProject,
} from "@/shared/lib/editable-files-storage";
import {
  getProject,
  listProjects,
  PROJECTS_STORAGE_KEY,
} from "@/shared/lib/projects-storage";
import { nodeShapeIssues } from "@/shared/lib/story-validation";
import type { MetadataConfigTemplate } from "@/shared/types";

import {
  commitStorageTransaction,
  metadataUndoKey,
  metadataUndoLifetime,
  metadataUndoMaxBytes,
  pruneMetadataUndo,
} from "./helpers";
import type { MetadataEdit, MetadataRefactorPlan, MetadataUndo } from "./types";

export {
  recoverMetadataTransaction,
  metadataUndoKey,
  pruneMetadataUndo,
} from "./helpers";
export type { MetadataEdit, MetadataRefactorPlan, MetadataUndo } from "./types";

export const createMetadataEdits = (
  config: MetadataConfigTemplate,
): MetadataEdit[] =>
  config.config.map((field, index) => ({
    id: `field:${index}:${field.name}`,
    originalName: field.name,
    field: { ...field },
    defaultValue: field.type === "number" ? 0 : false,
    conversion: "none",
  }));

const serializeUndo = (
  plan: MetadataRefactorPlan,
  afterFiles: MetadataRefactorPlan["nextFiles"],
  now: number,
) => {
  const undo: MetadataUndo = {
    expiresAt: now + metadataUndoLifetime,
    projectId: plan.projectId,
    beforeConfig: plan.baseConfig,
    afterConfig: plan.nextConfig,
    beforeFiles: plan.baseFiles,
    afterFiles,
  };
  const raw = JSON.stringify(undo);
  return raw.length * 2 <= metadataUndoMaxBytes ? raw : null;
};

export const planMetadataRefactor = (
  projectId: string,
  edits: MetadataEdit[],
  storage: Storage = localStorage,
): MetadataRefactorPlan => {
  const project = getProject(projectId, { storage });
  if (!project) throw new Error("Project not found.");
  const baseFiles = listEditableFilesByProject(projectId, { storage });
  const nextConfig: MetadataConfigTemplate = {
    config: edits.flatMap((edit) => (edit.field ? [edit.field] : [])),
  };
  const plan: MetadataRefactorPlan = {
    projectId,
    baseConfig: project.metadataConfig,
    nextConfig,
    baseFiles,
    nextFiles: [],
    changes: [],
    errors: [],
    undoAvailable: false,
  };
  const names = new Set<string>();
  const signs = new Set<string>();
  for (const field of nextConfig.config) {
    if (!field.name.trim() || field.name !== field.name.trim())
      plan.errors.push(
        "Field names must be non-empty and have no surrounding whitespace.",
      );
    if (!field.sign.trim())
      plan.errors.push(`“${field.name}” needs an import sign.`);
    if (names.has(field.name))
      plan.errors.push(`Duplicate field name “${field.name}”.`);
    if (signs.has(field.sign))
      plan.errors.push(`Duplicate import sign “${field.sign}”.`);
    if (field.type !== "number" && field.type !== "boolean")
      plan.errors.push(`Unsupported type for “${field.name}”.`);
    names.add(field.name);
    signs.add(field.sign);
  }
  for (const field of project.metadataConfig.config) {
    if (!edits.some((edit) => edit.originalName === field.name))
      plan.errors.push(
        `The definition “${field.name}” changed. Reopen the refactor to review the current definitions.`,
      );
  }
  const vacated = new Set(
    edits
      .filter(
        (edit) =>
          edit.originalName !== null && edit.field?.name !== edit.originalName,
      )
      .map((edit) => edit.originalName),
  );
  plan.nextFiles = baseFiles.map((file) => ({
    ...file,
    content: {
      ...file.content,
      nodes: file.content.nodes.map((node) => {
        const shape = nodeShapeIssues(node);
        if (shape.length) {
          plan.errors.push(`${file.name} · ${node.name}: ${shape[0].message}`);
          return node;
        }
        const metadata = { ...node.metadata };
        for (const name of vacated) if (name !== null) delete metadata[name];
        for (const edit of edits) {
          const field = edit.field;
          if (!field) continue;
          const from = edit.originalName ?? field.name;
          const hasValue = Object.hasOwn(node.metadata, from);
          let value = hasValue ? node.metadata[from] : edit.defaultValue;
          if (
            edit.originalName !== null &&
            field.name !== edit.originalName &&
            Object.hasOwn(node.metadata, field.name) &&
            !vacated.has(field.name) &&
            node.metadata[field.name] !== value
          ) {
            plan.errors.push(
              `${file.name} · ${node.name}: “${field.name}” already has a different value. Resolve the collision before renaming.`,
            );
            continue;
          }
          if (typeof value !== field.type && edit.conversion === "binary") {
            if (field.type === "number" && typeof value === "boolean")
              value = value ? 1 : 0;
            else if (field.type === "boolean" && (value === 0 || value === 1))
              value = value === 1;
          }
          if (
            typeof value !== field.type ||
            (typeof value === "number" && !Number.isFinite(value))
          ) {
            plan.errors.push(
              `${file.name} · ${node.name}: “${from}” cannot be converted to ${field.type}. Choose a conversion or correct the value first.`,
            );
            continue;
          }
          Object.defineProperty(metadata, field.name, {
            value,
            enumerable: true,
            configurable: true,
            writable: true,
          });
        }
        for (const field of new Set([
          ...Object.keys(node.metadata),
          ...Object.keys(metadata),
        ])) {
          if (node.metadata[field] !== metadata[field])
            plan.changes.push({
              fileId: file.id,
              fileName: file.name,
              nodeName: node.name,
              field,
              before: node.metadata[field],
              after: metadata[field],
            });
        }
        return { ...node, metadata };
      }),
    },
  }));
  const now = Date.now();
  plan.undoAvailable =
    serializeUndo(
      plan,
      plan.nextFiles.map((file) => ({ ...file, updatedAt: now })),
      now,
    ) !== null;
  return plan;
};

const comparableFiles = (files: MetadataRefactorPlan["baseFiles"]) =>
  [...files]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(({ updatedAt: _updatedAt, ...file }) => file);
const equal = (left: unknown, right: unknown) =>
  JSON.stringify(left) === JSON.stringify(right);

export const applyMetadataRefactor = (
  plan: MetadataRefactorPlan,
  storage: Storage = localStorage,
) => {
  if (plan.errors.length)
    throw new Error("Resolve refactor errors before applying.");
  const project = getProject(plan.projectId, { storage });
  const files = listEditableFilesByProject(plan.projectId, { storage });
  if (
    !project ||
    !equal(project.metadataConfig, plan.baseConfig) ||
    !equal(comparableFiles(files), comparableFiles(plan.baseFiles))
  ) {
    throw new Error(
      "The project changed after this preview. Preview the refactor again before applying.",
    );
  }
  const now = Date.now();
  const nextFiles = plan.nextFiles.map((file) => ({ ...file, updatedAt: now }));
  const nextById = new Map(nextFiles.map((file) => [file.id, file]));
  const allFiles = listEditableFiles({ storage }).map(
    (file) => nextById.get(file.id) ?? file,
  );
  const projects = listProjects({ storage }).map((entry) =>
    entry.id === plan.projectId
      ? { ...entry, metadataConfig: plan.nextConfig, updatedAt: now }
      : entry,
  );
  commitStorageTransaction(storage, {
    [EDITABLE_FILES_STORAGE_KEY]: JSON.stringify(allFiles),
    [PROJECTS_STORAGE_KEY]: JSON.stringify(projects),
    [metadataUndoKey(plan.projectId)]: serializeUndo(plan, nextFiles, now),
  });
};

export const getMetadataUndo = (
  projectId: string,
  storage: Storage = localStorage,
): MetadataUndo | null => {
  pruneMetadataUndo(storage);
  const raw = storage.getItem(metadataUndoKey(projectId));
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as MetadataUndo;
    return value.projectId === projectId &&
      value.beforeConfig?.config &&
      value.afterConfig?.config &&
      Array.isArray(value.beforeFiles) &&
      Array.isArray(value.afterFiles)
      ? value
      : null;
  } catch {
    return null;
  }
};

export const undoMetadataRefactor = (
  projectId: string,
  storage: Storage = localStorage,
) => {
  const undo = getMetadataUndo(projectId, storage);
  if (!undo) throw new Error("No metadata refactor to undo.");
  const project = getProject(projectId, { storage });
  const files = listEditableFilesByProject(projectId, { storage });
  if (
    !project ||
    !equal(project.metadataConfig, undo.afterConfig) ||
    !equal(comparableFiles(files), comparableFiles(undo.afterFiles))
  ) {
    throw new Error(
      "The project has changed since the refactor. Review a new refactor to preserve those edits.",
    );
  }
  const now = Date.now();
  const beforeById = new Map(undo.beforeFiles.map((file) => [file.id, file]));
  commitStorageTransaction(storage, {
    [EDITABLE_FILES_STORAGE_KEY]: JSON.stringify(
      listEditableFiles({ storage }).map((file) =>
        beforeById.has(file.id)
          ? { ...beforeById.get(file.id), updatedAt: now }
          : file,
      ),
    ),
    [PROJECTS_STORAGE_KEY]: JSON.stringify(
      listProjects({ storage }).map((entry) =>
        entry.id === projectId
          ? { ...entry, metadataConfig: undo.beforeConfig, updatedAt: now }
          : entry,
      ),
    ),
    [metadataUndoKey(projectId)]: null,
  });
};
