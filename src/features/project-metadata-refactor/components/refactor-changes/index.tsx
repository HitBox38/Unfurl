import type { MetadataRefactorPlan } from "@/shared/lib/project-metadata-refactor";
import { Button } from "@/shared/ui/button";

export const RefactorChanges = ({
  plan,
  visibleChanges,
  onShowMore,
}: {
  plan: MetadataRefactorPlan;
  visibleChanges: number;
  onShowMore: () => void;
}) => (
  <>
    <div className="overflow-auto rounded-xl border">
      <table className="w-full text-left text-xs">
        <thead className="bg-muted text-muted-foreground">
          <tr>
            <th className="p-2">Story / node</th>
            <th className="p-2">Field</th>
            <th className="p-2">Saved</th>
            <th className="p-2">After refactor</th>
          </tr>
        </thead>
        <tbody>
          {plan.changes.slice(0, visibleChanges).map((change, index) => (
            <tr key={index} className="border-t">
              <td className="p-2">
                {change.fileName}
                <br />
                <span className="font-mono text-muted-foreground">
                  {change.nodeName}
                </span>
              </td>
              <td className="p-2 font-mono">{change.field}</td>
              <td className="p-2 font-mono">
                {change.before === undefined
                  ? "(missing)"
                  : String(change.before)}
              </td>
              <td className="p-2 font-mono">
                {change.after === undefined
                  ? "(removed)"
                  : String(change.after)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    {plan.changes.length > visibleChanges ? (
      <Button variant="outline" onClick={onShowMore}>
        Show more changes ({plan.changes.length - visibleChanges} remaining)
      </Button>
    ) : null}
  </>
);
