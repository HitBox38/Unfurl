import { useState } from "react";
import { Braces, Plus, Trash2, Undo2 } from "lucide-react";

import { useProject } from "@/shared/hooks/use-projects";
import { useStorageSnapshot } from "@/shared/hooks/use-storage-snapshot";
import { applyMetadataRefactor, createMetadataEdits, getMetadataUndo, metadataUndoKey, planMetadataRefactor, undoMetadataRefactor, type MetadataEdit, type MetadataRefactorPlan } from "@/shared/lib/project-metadata-refactor";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/dialog";

export const ProjectMetadataRefactor = ({ projectId }: { projectId: string | null }) => {
  const project = useProject(projectId);
  const undoSnapshot = useStorageSnapshot(metadataUndoKey(projectId ?? ""));
  const [open, setOpen] = useState(false);
  const [edits, setEdits] = useState<MetadataEdit[]>([]);
  const [plan, setPlan] = useState<MetadataRefactorPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleChanges, setVisibleChanges] = useState(100);
  const canUndo = Boolean(undoSnapshot && projectId && getMetadataUndo(projectId));
  const patch = (id: string, change: Partial<MetadataEdit>) => { setPlan(null); setEdits((current) => current.map((edit) => edit.id === id ? { ...edit, ...change } : edit)); };
  const patchField = (edit: MetadataEdit, change: Partial<NonNullable<MetadataEdit["field"]>>) => {
    if (edit.field) patch(edit.id, { field: { ...edit.field, ...change } });
  };
  const preview = () => {
    if (!projectId) return;
    setError(null);
    try { setPlan(planMetadataRefactor(projectId, edits)); setVisibleChanges(100); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Could not preview metadata changes."); }
  };
  const apply = () => {
    if (!plan) return;
    try { applyMetadataRefactor(plan); setOpen(false); setPlan(null); setError(null); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Could not apply metadata changes."); }
  };
  const undo = () => {
    if (!projectId) return;
    try { undoMetadataRefactor(projectId); setError(null); if (project) setEdits(createMetadataEdits(project.metadataConfig)); setOpen(false); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Could not undo the metadata refactor."); }
  };
  const changed = Boolean(plan && (plan.changes.length || JSON.stringify(plan.baseConfig) !== JSON.stringify(plan.nextConfig)));
  return (
    <>
      <Button variant="outline" size="sm" disabled={!project} onClick={() => {
        if (!project) return;
        setEdits(createMetadataEdits(project.metadataConfig)); setPlan(null); setError(null); setOpen(true);
      }}><Braces className="size-4" />Metadata refactor</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="flex max-h-[85svh] flex-col sm:max-w-4xl">
          <DialogHeader><DialogTitle>Project metadata refactor</DialogTitle><DialogDescription>Review definition changes and their effects across every story in {project?.name}. This is separate from your pending story fix.</DialogDescription></DialogHeader>
          <div className="min-h-0 space-y-4 overflow-auto text-left">
            {error ? <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p> : null}
            {!plan ? (
              <>
                {edits.map((edit, index) => (
                  <section key={edit.id} className={`space-y-3 rounded-xl border p-3 ${edit.field ? "" : "border-destructive/30 bg-destructive/5"}`}>
                    {edit.field ? (
                      <>
                        <div className="grid gap-3 sm:grid-cols-4">
                          <label className="space-y-1 text-xs text-muted-foreground">Name<Input aria-label={`Metadata field ${index + 1} name`} value={edit.field.name} onChange={(event) => patchField(edit, { name: event.target.value })} /></label>
                          <label className="space-y-1 text-xs text-muted-foreground">Type
                            <Select value={edit.field.type} onValueChange={(value) => {
                              const type = value as "number" | "boolean";
                              patch(edit.id, { field: { ...edit.field!, type }, defaultValue: type === "number" ? 0 : false });
                            }}>
                              <SelectTrigger className="w-full" aria-label={`Metadata field ${index + 1} type`}><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="number">Number</SelectItem><SelectItem value="boolean">Boolean</SelectItem></SelectContent>
                            </Select>
                          </label>
                          <label className="space-y-1 text-xs text-muted-foreground">Import sign<Input aria-label={`Metadata field ${index + 1} sign`} value={edit.field.sign} onChange={(event) => patchField(edit, { sign: event.target.value })} /></label>
                          <label className="space-y-1 text-xs text-muted-foreground">Author label<Input aria-label={`Metadata field ${index + 1} label`} value={edit.field.label ?? ""} onChange={(event) => patchField(edit, { label: event.target.value })} /></label>
                        </div>
                        <div className="flex flex-wrap items-end gap-3">
                          <label className="min-w-32 space-y-1 text-xs text-muted-foreground">Fill missing values with
                            {edit.field.type === "number" ? <Input type="number" aria-label={`Metadata field ${index + 1} default`} value={String(edit.defaultValue)} onChange={(event) => patch(edit.id, { defaultValue: event.target.value === "" ? NaN : Number(event.target.value) })} /> : (
                              <Select value={String(edit.defaultValue)} onValueChange={(value) => patch(edit.id, { defaultValue: value === "true" })}>
                                <SelectTrigger className="w-full" aria-label={`Metadata field ${index + 1} default`}><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="false">False</SelectItem><SelectItem value="true">True</SelectItem></SelectContent>
                              </Select>
                            )}
                          </label>
                          <label className="min-w-48 space-y-1 text-xs text-muted-foreground">Type conversion
                            <Select value={edit.conversion} onValueChange={(conversion) => patch(edit.id, { conversion: conversion as MetadataEdit["conversion"] })}>
                              <SelectTrigger className="w-full" aria-label={`Metadata field ${index + 1} conversion`}><SelectValue /></SelectTrigger>
                              <SelectContent><SelectItem value="none">Keep matching values</SelectItem><SelectItem value="binary">Convert 0/1 ↔ false/true</SelectItem></SelectContent>
                            </Select>
                          </label>
                          <Button variant="ghost" size="icon" aria-label={`Remove metadata field ${edit.field.name || index + 1}`} onClick={() => patch(edit.id, { field: null })}><Trash2 className="size-4" /></Button>
                        </div>
                      </>
                    ) : <p className="text-sm">Remove definition “{edit.originalName ?? "New field"}” and its values from all stories. <Button size="sm" variant="ghost" onClick={() => {
                      const original = project?.metadataConfig.config.find((field) => field.name === edit.originalName);
                      if (original) patch(edit.id, { field: original });
                      else setEdits((current) => current.filter((entry) => entry.id !== edit.id));
                    }}>{edit.originalName ? "Restore" : "Dismiss"}</Button></p>}
                  </section>
                ))}
                {!edits.length ? <p className="py-3 text-sm text-muted-foreground">Define the data fields your game uses. New fields get an explicit default across all story nodes.</p> : null}
                <Button variant="outline" size="sm" onClick={() => setEdits((current) => [...current, { id: crypto.randomUUID(), originalName: null, field: { name: "", type: "number", sign: "", label: "" }, defaultValue: 0, conversion: "none" }])}><Plus className="size-4" />Add definition</Button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium">{plan.changes.length} value changes · {new Set(plan.changes.map((change) => change.nodeName + change.fileId)).size} nodes · {new Set(plan.changes.map((change) => change.fileId)).size} stories</p>
                <p className="text-xs text-muted-foreground">{plan.undoAvailable ? "Undo is available for seven days, provided no later saved edits would be overwritten." : "This refactor is too large to keep an undo snapshot within the 512 KB limit. Export your stories and metadata definitions before applying."}</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="min-w-0 rounded-xl border p-3"><h3 className="mb-2 text-xs text-muted-foreground">Saved definitions</h3><pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify(plan.baseConfig, null, 2)}</pre></div>
                  <div className="min-w-0 rounded-xl border p-3"><h3 className="mb-2 text-xs text-muted-foreground">After refactor</h3><pre className="max-h-48 overflow-auto whitespace-pre-wrap break-all text-xs">{JSON.stringify(plan.nextConfig, null, 2)}</pre></div>
                </div>
                {plan.errors.map((entry, index) => <p key={index} role="alert" className="text-sm text-destructive">{entry}</p>)}
                <div className="overflow-auto rounded-xl border">
                  <table className="w-full text-left text-xs"><thead className="bg-muted text-muted-foreground"><tr><th className="p-2">Story / node</th><th className="p-2">Field</th><th className="p-2">Saved</th><th className="p-2">After refactor</th></tr></thead><tbody>{plan.changes.slice(0, visibleChanges).map((change, index) => <tr key={index} className="border-t"><td className="p-2">{change.fileName}<br /><span className="font-mono text-muted-foreground">{change.nodeName}</span></td><td className="p-2 font-mono">{change.field}</td><td className="p-2 font-mono">{change.before === undefined ? "(missing)" : String(change.before)}</td><td className="p-2 font-mono">{change.after === undefined ? "(removed)" : String(change.after)}</td></tr>)}</tbody></table>
                </div>
                {plan.changes.length > visibleChanges ? <Button variant="outline" onClick={() => setVisibleChanges(visibleChanges + 100)}>Show more changes ({plan.changes.length - visibleChanges} remaining)</Button> : null}
              </>
            )}
          </div>
          <DialogFooter className="shrink-0 border-t pt-4">
            {canUndo ? <Button variant="outline" onClick={undo}><Undo2 className="size-4" />Undo last refactor</Button> : null}
            <Button variant="secondary" onClick={() => plan ? setPlan(null) : setOpen(false)}>{plan ? "Edit definitions" : "Cancel"}</Button>
            {plan ? <Button disabled={plan.errors.length > 0 || !changed} onClick={apply}>Apply project refactor</Button> : <Button onClick={preview}>Review project changes</Button>}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
