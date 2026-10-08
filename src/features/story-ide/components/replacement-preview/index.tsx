import { previewReplacement, displayPath } from "@/features/story-ide/search";
import type { NodeDocument } from "@/features/story-ide/types";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";

interface ReplacementPreviewProps {
  preview: ReturnType<typeof previewReplacement>;
  previewOpen: boolean;
  setPreviewOpen: (open: boolean) => void;
  onReplace: (documents: NodeDocument[]) => void;
}
export const ReplacementPreview = ({
  preview,
  previewOpen,
  setPreviewOpen,
  onReplace,
}: ReplacementPreviewProps) => (
  <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
    <DialogContent className="flex max-h-[80svh] flex-col sm:max-w-3xl">
      <DialogHeader>
        <DialogTitle>Preview replacements</DialogTitle>
        <DialogDescription>
          {preview.changes.length} field changes across{" "}
          {
            new Set(preview.changes.map((change) => change.match.documentId))
              .size
          }{" "}
          nodes. Replacements join your pending fix.
        </DialogDescription>
      </DialogHeader>
      <div className="min-h-0 space-y-3 overflow-auto text-left">
        {preview.errors.map((error) => (
          <p key={error} role="alert" className="text-sm text-destructive">
            {error}
          </p>
        ))}
        {preview.changes.map((change, index) => (
          <div key={index} className="rounded-lg border p-3 text-sm">
            <p className="mb-1 text-xs text-muted-foreground">
              {change.match.nodeName} · {displayPath(change.match.path)}
            </p>
            <p className="break-all font-mono">
              <span className="text-muted-foreground">
                {String(change.match.value)}
              </span>{" "}
              → {String(change.next)}
            </p>
          </div>
        ))}
        {!preview.changes.length && !preview.errors.length ? (
          <p className="text-sm text-muted-foreground">
            No values would change.
          </p>
        ) : null}
      </div>
      <DialogFooter>
        <Button variant="secondary" onClick={() => setPreviewOpen(false)}>
          Cancel
        </Button>
        <Button
          disabled={!preview.changes.length || preview.errors.length > 0}
          onClick={() => {
            onReplace(preview.documents);
            setPreviewOpen(false);
          }}
        >
          Stage replacements
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
