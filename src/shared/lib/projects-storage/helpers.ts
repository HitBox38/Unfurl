import { STORAGE_EVENT } from "@/shared/hooks/use-storage";
import type { ProjectRecord } from "@/shared/types";

import { PROJECTS_STORAGE_KEY, UNTITLED_PROJECT_NAME } from "./constants";

export const createProjectId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

export const getStorage = (storage?: Storage) => storage ?? localStorage;

export const defaultTimestamp = () => Date.now();

export const normalizeProjectName = (name: string) =>
  name.trim() || UNTITLED_PROJECT_NAME;

export const readProjects = (storage: Storage): ProjectRecord[] => {
  const raw = storage.getItem(PROJECTS_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as ProjectRecord[]) : [];
  } catch {
    storage.removeItem(PROJECTS_STORAGE_KEY);
    return [];
  }
};

const notifyProjectsChange = (projects: ProjectRecord[]) => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(STORAGE_EVENT, {
      detail: { key: PROJECTS_STORAGE_KEY, newValue: projects },
    }),
  );
};

export const writeProjects = (storage: Storage, projects: ProjectRecord[]) => {
  storage.setItem(PROJECTS_STORAGE_KEY, JSON.stringify(projects));
  notifyProjectsChange(projects);
};

export const sortOldestFirst = (projects: ProjectRecord[]) =>
  [...projects].sort((a, b) => a.createdAt - b.createdAt);
