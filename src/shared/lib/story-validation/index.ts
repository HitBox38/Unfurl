import type { StoryNode } from "@/shared/types";

export type StoryPath = (string | number)[];

export interface ShapeIssue {
  path: StoryPath;
  message: string;
}

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const nodeShapeIssues = (value: unknown): ShapeIssue[] => {
  const issues: ShapeIssue[] = [];
  const issue = (path: StoryPath, message: string) => issues.push({ path, message });
  if (!isRecord(value)) return [{ path: [], message: "A node must be a JSON object." }];

  const keys = new Set(["name", "content", "choices", "metadata", "position", "size"]);
  for (const key of Object.keys(value)) {
    if (!keys.has(key)) issue([key], `Unknown node field “${key}”. Extend the shared story model to add fields.`);
  }
  if (typeof value.name !== "string" || !value.name.trim()) {
    issue(["name"], "Node name must be a non-empty string.");
  } else if (value.name !== value.name.trim()) {
    issue(["name"], "Node names cannot have leading or trailing whitespace.");
  }
  if (!Array.isArray(value.content)) issue(["content"], "Content must be an array of strings.");
  else value.content.forEach((line, index) => {
    if (typeof line !== "string") issue(["content", index], "Each content line must be a string.");
  });
  if (!Array.isArray(value.choices)) issue(["choices"], "Choices must be an array.");
  else value.choices.forEach((choice, index) => {
    if (!isRecord(choice)) {
      issue(["choices", index], "A choice must have text and a destination.");
      return;
    }
    for (const key of Object.keys(choice)) {
      if (key !== "text" && key !== "destination") issue(["choices", index, key], `Unknown choice field “${key}”.`);
    }
    if (typeof choice.text !== "string") issue(["choices", index, "text"], "Choice text must be a string.");
    if (typeof choice.destination !== "string") issue(["choices", index, "destination"], "Choice destination must be a node name.");
  });
  if (!isRecord(value.metadata)) issue(["metadata"], "Metadata must be an object.");
  else for (const [key, entry] of Object.entries(value.metadata)) {
    if (!key.trim()) issue(["metadata", key], "Metadata field names must not be empty.");
    if (typeof entry !== "boolean" && (typeof entry !== "number" || !Number.isFinite(entry))) {
      issue(["metadata", key], "Metadata values must be finite numbers or booleans.");
    }
  }
  for (const [key, dimensions] of [["position", ["x", "y"]], ["size", ["width", "height"]]] as const) {
    const entry = value[key];
    if (entry === undefined) continue;
    if (!isRecord(entry)) {
      issue([key], `${key} must be an object.`);
      continue;
    }
    for (const dimension of Object.keys(entry)) {
      if (!(dimensions as readonly string[]).includes(dimension)) issue([key, dimension], `Unknown ${key} field “${dimension}”.`);
    }
    for (const dimension of dimensions) {
      if (typeof entry[dimension] !== "number" || !Number.isFinite(entry[dimension]) || (key === "size" && entry[dimension] <= 0)) {
        issue([key, dimension], `${dimension} must be ${key === "size" ? "a positive" : "a finite"} number.`);
      }
    }
  }
  return issues;
};

export const isStoryNode = (value: unknown): value is StoryNode =>
  nodeShapeIssues(value).length === 0;
