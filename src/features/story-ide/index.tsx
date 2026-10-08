import { useMemo, useState } from "react";
import { CircleAlert, Code2, Download, Files, ListChecks, Plus, Search, Trash2, X } from "lucide-react";

import { ProjectMetadataRefactor } from "@/features/project-metadata-refactor";
import { StoryGraphPreview } from "@/features/story-graph-preview";
import { useConfirmDialog } from "@/shared/hooks/use-confirm-dialog";
import { useProject } from "@/shared/hooks/use-projects";
import { getEditableFile } from "@/shared/lib/editable-files-storage";
import { getProject } from "@/shared/lib/projects-storage";
import { downloadJsonFile } from "@/shared/lib/download-json-file";
import { cn } from "@/shared/lib/cn";
import { useJsonDataStore, useNodeStore } from "@/shared/stores";
import type { StoryNode } from "@/shared/types";
import { Button } from "@/shared/ui/button";
import { Badge } from "@/shared/ui/badge";

import { DraftReview } from "./components/draft-review";
import { JsonNodeEditor } from "./components/json-node-editor";
import { StorySearch } from "./components/story-search";
import { canApplyDraft, draftChanges, evaluateDraft, parseDocument, serializeNode, stageDocuments, workspaceHasChanges } from "./draft";
import { useStoryIdeStore } from "./hooks/use-story-ide-store";
import { valuesEqual } from "./merge";
import { displayPath } from "./search";
import type { EditorLocation, SearchMatch } from "./types";

export const StoryIde = ({ fileId }: { fileId: string }) => {
  const workspace = useStoryIdeStore((state) => state.workspaces[fileId]);
  const storageError = useStoryIdeStore((state) => state.storageError);
  const saved = useJsonDataStore((state) => state.content);
  const projectId = useJsonDataStore((state) => state.activeProjectId);
  const project = useProject(projectId);
  const confirm = useConfirmDialog();
  const [sidebar, setSidebar] = useState<"nodes" | "search">("nodes");
  const [reviewOpen, setReviewOpen] = useState(false);
  const [location, setLocation] = useState<EditorLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const base = workspace?.base;
  const documents = workspace?.documents;
  const resolutions = workspace?.resolutions;
  const result = useMemo(() => base && documents && resolutions ? evaluateDraft({ base, documents, resolutions }, saved, project?.metadataConfig) : null, [base, documents, resolutions, saved, project?.metadataConfig]);
  const pending = useMemo(() => base && documents ? workspaceHasChanges({ base, documents }) : false, [base, documents]);
  const activeDocument = workspace?.documents.find((document) => document.id === workspace.activeId);
  const activeNode = activeDocument && result?.nodesByDocument.get(activeDocument.id);
  const activeIssues = useMemo(() => result?.issues.filter((issue) => issue.documentId === activeDocument?.id) ?? [], [result, activeDocument?.id]);
  const actions = useStoryIdeStore.getState();
  const select = (documentId: string, path?: SearchMatch["path"], key?: boolean) => {
    actions.selectDocument(fileId, documentId);
    const document = workspace?.documents.find((entry) => entry.id === documentId);
    const node = saved.nodes.find((entry) => entry.name === document?.originalName);
    if (node) useNodeStore.getState().setNode(node);
    if (path) setLocation({ documentId, path, key, token: Date.now() });
  };
  const selectPreview = (node: StoryNode) => {
    const documentId = [...result?.mergedByDocument ?? []].find(([, entry]) => entry.name === node.name)?.[0]
      ?? workspace?.documents.find((entry) => entry.lastName === node.name || entry.originalName === node.name)?.id;
    if (documentId) select(documentId);
  };
  const currentResult = () => {
    const currentWorkspace = useStoryIdeStore.getState().workspaces[fileId];
    const file = getEditableFile(fileId);
    if (!currentWorkspace || !file) throw new Error("The saved story is no longer available.");
    if (!valuesEqual(file.content, saved)) {
      useJsonDataStore.getState().syncSavedFile();
      throw new Error("The saved story changed. Review the merged fix again.");
    }
    const currentProject = getProject(file.projectId);
    const next = evaluateDraft(currentWorkspace, file.content, currentProject?.metadataConfig);
    if (!canApplyDraft(next) || !next.story) throw new Error("Resolve validation errors and conflicts before continuing.");
    return { next, file };
  };
  const apply = () => {
    try {
      const { next, file } = currentResult();
      const selected = activeDocument && next.mergedByDocument.get(activeDocument.id);
      useJsonDataStore.getState().applyStory(next.story!, file.content);
      actions.reset(fileId, next.story!);
      if (selected) useNodeStore.getState().setNode(selected);
      setReviewOpen(false); setError(null); setNotice("Complete fix applied. You can undo it from file history.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not apply the fix."); }
  };
  const exportTestCopy = () => {
    try {
      const { next, file } = currentResult();
      downloadJsonFile(`${file.name || "story"}-test-copy.json`, next.story);
      setError(null); setNotice("Test copy exported. The saved story has not changed.");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not export the test copy."); }
  };
  const discard = () => confirm({
    title: "Discard pending story fix?", description: "Discard the node drafts and return to the latest saved story. Open tabs and search will be kept.", confirmLabel: "Discard fix",
    onConfirm: () => { actions.reset(fileId, getEditableFile(fileId)?.content ?? saved); setError(null); setNotice("Pending fix discarded."); },
  });

  if (!workspace || !result) return <div className="p-6 text-left text-sm text-muted-foreground">Preparing story IDE…</div>;
  const errors = result.issues.filter((issue) => issue.severity === "error").length;
  const warnings = result.issues.length - errors;
  const valid = canApplyDraft(result);
  const previewCurrent = valid && valuesEqual(result.story, workspace.lastValid);
  const changedNodes = result.story ? draftChanges(saved, result.story).length : workspace.documents.filter((document) => document.deleted || !document.originalName || !valuesEqual(parseDocument(document).node, workspace.base.nodes.find((node) => node.name === document.originalName))).length;

  return (
    <section className="story-ide workspace-bubble flex h-full min-h-0 min-w-0 flex-col overflow-hidden text-left" aria-label="Story IDE">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="flex min-w-0 items-center gap-2"><Code2 className="size-4 text-chart-2" /><span className="text-sm font-medium">Story IDE</span><Badge variant="secondary">{pending ? `${changedNodes} nodes in pending fix` : "Saved story"}</Badge></div>
        <div className="flex flex-wrap gap-2">
          <ProjectMetadataRefactor projectId={projectId} />
          <Button variant="outline" size="sm" disabled={!valid} onClick={exportTestCopy}><Download className="size-4" />Export test copy</Button>
          <Button variant="secondary" size="sm" disabled={!pending} onClick={discard}>Discard fix</Button>
          <Button size="sm" disabled={!pending} onClick={() => { setError(null); setReviewOpen(true); }}><ListChecks className="size-4" />Review fix</Button>
        </div>
      </div>
      {storageError || error ? <p role="alert" className="shrink-0 border-b bg-destructive/10 px-4 py-2 text-sm text-destructive">{storageError ?? error}</p> : null}
      {notice ? <p role="status" className="flex shrink-0 items-center justify-between gap-2 border-b bg-muted/50 px-4 py-2 text-xs text-muted-foreground">{notice}<Button variant="ghost" size="icon-xs" aria-label="Dismiss IDE message" onClick={() => setNotice(null)}><X className="size-3" /></Button></p> : null}
      <div className="story-ide-body min-h-0 flex-1" data-sidebar={sidebar}>
        <aside className="ide-sidebar flex min-h-0 flex-col border-r bg-muted/15" aria-label="Story investigation">
          <div className="flex shrink-0 items-center gap-1 border-b p-2">
            <Button size="sm" variant={sidebar === "nodes" ? "secondary" : "ghost"} aria-pressed={sidebar === "nodes"} onClick={() => setSidebar("nodes")}><Files className="size-4" />Nodes</Button>
            <Button size="sm" variant={sidebar === "search" ? "secondary" : "ghost"} aria-pressed={sidebar === "search"} onClick={() => setSidebar("search")}><Search className="size-4" />Search</Button>
            <Button variant="ghost" size="icon-sm" className="ml-auto" aria-label="Add draft node" title="Add draft node" onClick={() => actions.addNode(fileId)}><Plus className="size-4" /></Button>
          </div>
          {sidebar === "nodes" ? (
            <div className="min-h-0 flex-1 overflow-auto p-2" aria-label="Node explorer">
              {workspace.documents.map((document) => {
                const node = result.nodesByDocument.get(document.id);
                const name = node?.name ?? document.lastName ?? document.originalName ?? "New node";
                const original = workspace.base.nodes.find((entry) => entry.name === document.originalName);
                const dirty = document.deleted || !valuesEqual(node, original);
                return <Button key={document.id} variant="ghost" className={cn("mb-0.5 h-auto w-full justify-between gap-2 px-2 py-2 text-left", document.id === workspace.activeId && "bg-accent", document.deleted && "text-muted-foreground line-through")} onClick={() => select(document.id)}><span className="min-w-0 truncate font-mono text-xs">{name}</span>{dirty ? <span className="shrink-0 text-[10px] text-muted-foreground">{document.deleted ? "removed" : "draft"}</span> : null}</Button>;
              })}
              {!workspace.documents.length ? <p className="p-2 text-xs text-muted-foreground">Add a node to begin editing.</p> : null}
            </div>
          ) : <StorySearch documents={workspace.documents} search={workspace.search} onSearch={(search) => actions.setSearch(fileId, search)} onSelect={(match) => select(match.documentId, match.path, match.key)} onReplace={(documents) => { actions.update(fileId, (current) => stageDocuments(current, documents), true); setNotice("Replacements staged. Review the complete fix before applying."); }} />}
          <section className="ide-graph-window shrink-0 border-t" aria-label="Graph preview window">
            <div className="flex items-center justify-between gap-2 px-3 py-2 text-[11px]"><span className="font-medium">Graph preview</span><span className={previewCurrent ? "text-muted-foreground" : "text-warning"}>{previewCurrent ? "Read only" : "Out of date"}</span></div>
            <div className="h-44"><StoryGraphPreview story={workspace.lastValid} selectedName={activeNode?.name ?? activeDocument?.originalName} compact onSelect={selectPreview} /></div>
          </section>
        </aside>
        <div className="flex min-h-0 min-w-0 flex-col">
          <div role="tablist" aria-label="Open node tabs" className="flex shrink-0 overflow-x-auto border-b bg-muted/20">
            {workspace.tabs.map((id, index) => {
              const document = workspace.documents.find((entry) => entry.id === id);
              if (!document) return null;
              const node = result.nodesByDocument.get(id);
              const name = node?.name ?? document.lastName ?? document.originalName ?? "New node";
              const dirty = document.deleted || !valuesEqual(node, workspace.base.nodes.find((entry) => entry.name === document.originalName));
              return <div key={id} className={cn("flex shrink-0 items-center border-r", workspace.activeId === id && "bg-card")}><button id={`ide-tab-${id}`} role="tab" aria-selected={workspace.activeId === id} aria-controls="node-json-panel" tabIndex={workspace.activeId === id ? 0 : -1} className="flex max-w-52 items-center gap-2 px-3 py-3 font-mono text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => select(id)} onKeyDown={(event) => {
                let next: string | undefined;
                if (event.key === "ArrowRight") next = workspace.tabs[(index + 1) % workspace.tabs.length];
                else if (event.key === "ArrowLeft") next = workspace.tabs[(index - 1 + workspace.tabs.length) % workspace.tabs.length];
                else if (event.key === "Home") next = workspace.tabs[0];
                else if (event.key === "End") next = workspace.tabs.at(-1);
                if (next) { event.preventDefault(); select(next); window.document.getElementById(`ide-tab-${next}`)?.focus(); }
              }}><span className={cn("truncate", document.deleted && "line-through")}>{name}</span>{dirty ? <span className="size-1.5 shrink-0 rounded-full bg-chart-2" aria-label="Pending changes" /> : null}</button><Button variant="ghost" size="icon-xs" className="mr-1 shrink-0" aria-label={`Close tab ${name}`} onClick={() => actions.closeTab(fileId, id)}><X className="size-3" /></Button></div>;
            })}
          </div>
          {activeDocument ? (
            <>
              <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b px-3 py-2">
                <p className="min-w-0 truncate text-xs text-muted-foreground">{activeDocument.deleted ? "Node staged for removal" : `${activeNode?.name ?? activeDocument.originalName ?? "Node"}.json`}</p>
                <div className="flex gap-1"><Button variant="ghost" size="sm" disabled={!activeNode || activeDocument.deleted} onClick={() => actions.editDocument(fileId, activeDocument.id, serializeNode(activeNode!))}>Format JSON</Button><Button variant="ghost" size="sm" onClick={() => actions.deleteNode(fileId, activeDocument.id)}>{activeDocument.deleted ? "Restore node" : <><Trash2 className="size-3.5" />Remove node</>}</Button></div>
              </div>
              <div id="node-json-panel" role="tabpanel" aria-labelledby={`ide-tab-${activeDocument.id}`} className="min-h-0 flex-1 overflow-hidden">
                {activeDocument.deleted ? <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">This node and its incoming choices will be removed when you apply the fix.</div> : <JsonNodeEditor document={activeDocument} nodeNames={result.story?.nodes.map((node) => node.name) ?? saved.nodes.map((node) => node.name)} fields={project?.metadataConfig.config ?? []} issues={activeIssues} location={location} onChange={(text) => { actions.editDocument(fileId, activeDocument.id, text); setNotice(null); }} />}
              </div>
            </>
          ) : <div className="flex min-h-0 flex-1 items-center justify-center p-8"><div className="max-w-xs text-center"><Code2 className="mx-auto mb-3 size-8 text-muted-foreground" /><p className="text-sm font-medium">Open a node to investigate</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Choose a node, select a search result, or click the graph preview. Closing a tab keeps its draft.</p></div></div>}
          <section className="shrink-0 border-t" aria-label="Story diagnostics">
            <div className="flex items-center justify-between gap-2 px-3 py-2 text-xs"><span className="flex items-center gap-2 font-medium"><CircleAlert className="size-3.5" />Diagnostics</span><span className="text-muted-foreground">{errors} errors · {warnings} warnings · {result.conflicts.length} conflicts</span></div>
            {result.issues.length || result.conflicts.length ? <div className="max-h-28 overflow-auto px-3 pb-2">{result.issues.map((issue, index) => <button key={index} className={cn("block w-full py-1 text-left text-xs hover:underline", issue.severity === "error" ? "text-destructive" : "text-muted-foreground")} onClick={() => { if (issue.documentId) select(issue.documentId, issue.path); }}>{displayPath(issue.path)} · {issue.message}</button>)}{result.conflicts.length ? <Button variant="link" size="sm" className="h-auto px-0 py-1 text-xs" onClick={() => setReviewOpen(true)}>Resolve saved-story conflicts in Review fix</Button> : null}</div> : <p className="px-3 pb-2 text-xs text-muted-foreground">No structural problems found. Verify game behavior with an exported test copy.</p>}
          </section>
          <div className="flex shrink-0 flex-wrap justify-between gap-2 border-t bg-muted/15 px-3 py-2 text-[11px] text-muted-foreground"><span>JSON · Ctrl/⌘ Space for suggestions</span><span>Renames and removals update story links in review.</span></div>
        </div>
      </div>
      <DraftReview open={reviewOpen} onOpenChange={setReviewOpen} saved={saved} result={result} error={error} onApply={apply} onResolve={(id, resolution) => actions.resolve(fileId, id, resolution)} />
    </section>
  );
};

export default StoryIde;
