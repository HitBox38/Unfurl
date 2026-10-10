import { useState } from "react";

import { useProject } from "@/shared/hooks/use-projects";
import { useStorageSnapshot } from "@/shared/hooks/use-storage-snapshot";
import {
  applyMetadataRefactor,
  createMetadataEdits,
  getMetadataUndo,
  metadataUndoKey,
  planMetadataRefactor,
  undoMetadataRefactor,
  type MetadataEdit,
  type MetadataRefactorPlan,
} from "@/shared/lib/project-metadata-refactor";

export const useMetadataRefactor = (projectId: string | null) => {
  const project = useProject(projectId);
  const undoSnapshot = useStorageSnapshot(metadataUndoKey(projectId ?? ""));
  const [open, setOpen] = useState(false);
  const [edits, setEdits] = useState<MetadataEdit[]>([]);
  const [plan, setPlan] = useState<MetadataRefactorPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleChanges, setVisibleChanges] = useState(100);
  const canUndo = Boolean(
    undoSnapshot && projectId && getMetadataUndo(projectId),
  );
  const patch = (id: string, change: Partial<MetadataEdit>) => {
    setPlan(null);
    setEdits((current) =>
      current.map((edit) => (edit.id === id ? { ...edit, ...change } : edit)),
    );
  };
  const patchField = (
    edit: MetadataEdit,
    change: Partial<NonNullable<MetadataEdit["field"]>>,
  ) => {
    if (edit.field) patch(edit.id, { field: { ...edit.field, ...change } });
  };
  const preview = () => {
    if (!projectId) return;
    setError(null);
    try {
      setPlan(planMetadataRefactor(projectId, edits));
      setVisibleChanges(100);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not preview metadata changes.",
      );
    }
  };
  const apply = () => {
    if (!plan) return;
    try {
      applyMetadataRefactor(plan);
      setOpen(false);
      setPlan(null);
      setError(null);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not apply metadata changes.",
      );
    }
  };
  const undo = () => {
    if (!projectId) return;
    try {
      undoMetadataRefactor(projectId);
      setError(null);
      if (project) setEdits(createMetadataEdits(project.metadataConfig));
      setOpen(false);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : "Could not undo the metadata refactor.",
      );
    }
  };
  const changed = Boolean(
    plan &&
      (plan.changes.length ||
        JSON.stringify(plan.baseConfig) !== JSON.stringify(plan.nextConfig)),
  );

  const start = () => {
    if (!project) return;
    setEdits(createMetadataEdits(project.metadataConfig));
    setPlan(null);
    setError(null);
    setOpen(true);
  };
  const addDefinition = () =>
    setEdits((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        originalName: null,
        field: { name: "", type: "number", sign: "", label: "" },
        defaultValue: 0,
        conversion: "none",
      },
    ]);
  const restoreDefinition = (edit: MetadataEdit) => {
    const original = project?.metadataConfig.config.find(
      (field) => field.name === edit.originalName,
    );
    if (original) patch(edit.id, { field: original });
    else setEdits((current) => current.filter((entry) => entry.id !== edit.id));
  };
  return {
    project,
    open,
    setOpen,
    edits,
    plan,
    setPlan,
    error,
    visibleChanges,
    setVisibleChanges,
    canUndo,
    patch,
    patchField,
    preview,
    apply,
    undo,
    changed,
    start,
    addDefinition,
    restoreDefinition,
  };
};
export type MetadataRefactorController = ReturnType<typeof useMetadataRefactor>;
