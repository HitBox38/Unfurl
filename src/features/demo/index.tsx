import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { useOpenEditableFile } from "@/features/open-editable-file";
import { fromTwee } from "@/shared/lib/convertors";
import { listProjects } from "@/shared/lib/projects-storage";
import { Button } from "@/shared/ui/button";

import { KONAMI_SEQUENCE, RESET_DELAY_MS } from "./constants";

export const DemoButton = () => {
  const [isDemoFileButtonVisible, setIsDemoFileButtonVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const openEditableFile = useOpenEditableFile();

  const inputSequence = useRef<string[]>([]);
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }

      inputSequence.current.push(e.code);
      if (inputSequence.current.length > KONAMI_SEQUENCE.length) {
        inputSequence.current.shift();
      }

      resetTimer.current = window.setTimeout(() => {
        inputSequence.current = [];
      }, RESET_DELAY_MS);

      const isKonami = KONAMI_SEQUENCE.every(
        (code, index) => code === inputSequence.current[index],
      );

      if (isKonami) {
        setIsDemoFileButtonVisible((prev) => !prev);
        if (resetTimer.current !== null) {
          window.clearTimeout(resetTimer.current);
        }
        inputSequence.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (resetTimer.current !== null) {
        window.clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const loadDemoFile = async () => {
    // The migration guarantees a project exists; the demo lands in the oldest one.
    const [project] = listProjects();
    if (!project) {
      throw new Error("No project available to import the demo file into");
    }
    setIsLoading(true);
    try {
      const response = await fetch("/Lorcan02.1.twee");
      const blob = await response.blob();
      const file = new File([blob], "Lorcan02.1.twee");
      const data = await fromTwee(file, { config: project.metadataConfig });
      openEditableFile(data, "Lorcan02.1", "twee", project.id);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isDemoFileButtonVisible) {
    return null;
  }

  return (
    <Button
      variant="success"
      onClick={loadDemoFile}
      disabled={isLoading}
      aria-label="Load demo file"
    >
      {isLoading ? <Loader2 className="animate-spin" /> : "Demo file"}
    </Button>
  );
};
