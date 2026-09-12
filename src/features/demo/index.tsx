import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useOpenEditableFile } from "@/features/open-editable-file";
import { fromTwee } from "@/shared/lib/convertors";
import { listProjects } from "@/shared/lib/projects-storage";
import type { ProjectRecord } from "@/shared/types";
import { Button } from "@/shared/ui/button";

export const DemoButton = ({
  project: targetProject,
}: {
  project?: ProjectRecord;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const openEditableFile = useOpenEditableFile();
  const loadDemoFile = async () => {
    const project = targetProject ?? listProjects()[0];
    if (!project) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/Lorcan02.1.twee");
      if (!response.ok) throw new Error("Sample unavailable");
      const file = new File([await response.blob()], "Lorcan02.1.twee");
      const data = await fromTwee(file, { config: project.metadataConfig });
      openEditableFile(data, "Lorcan02.1", "twee", project.id);
    } catch {
      setError("Could not load the sample. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <Button
        variant="secondary"
        onClick={() => void loadDemoFile()}
        disabled={isLoading}
        aria-label="Try a sample"
      >
        {isLoading ? <Loader2 className="animate-spin" /> : null}Try a sample
      </Button>
      {error ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
};
