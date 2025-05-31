import { useEffect, useRef, useState } from "react";
import { Button, CircularProgress } from "@mui/material";
import { fromTwee } from "../functions/convertors/fromTwee";
import { useJsonDataStore } from "../stores/JsonData";

export const DemoButton = () => {
  const [isDemoFileButtonVisible, setIsDemoFileButtonVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setJson: setJsonData } = useJsonDataStore((state) => state);

  const konamiSequence = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "KeyB",
    "KeyA",
  ];

  const inputSequence = useRef<string[]>([]);
  const resetTimer = useRef<number | null>(null);

  useEffect(() => {
    const resetDelay = 2000;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (resetTimer.current !== null) {
        clearTimeout(resetTimer.current);
      }

      inputSequence.current.push(e.code);

      if (inputSequence.current.length > konamiSequence.length) {
        inputSequence.current.shift();
      }

      resetTimer.current = window.setTimeout(() => {
        inputSequence.current = [];
      }, resetDelay);

      const isKonamiCode = konamiSequence.every(
        (code, index) => code === inputSequence.current[index]
      );

      if (isKonamiCode) {
        setIsDemoFileButtonVisible((prev) => !prev);
        if (resetTimer.current !== null) {
          clearTimeout(resetTimer.current);
        }
        inputSequence.current = [];
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      if (resetTimer.current !== null) {
        clearTimeout(resetTimer.current);
      }
    };
  }, []);

  const loadDemoFile = () => {
    setIsLoading(true);
    fetch("/Lorcan02.1.twee")
      .then((response) => response.blob())
      .then((blob) => {
        const file = new File([blob], "Lorcan02.1.twee");
        fromTwee(file)
          .then((value) => {
            setJsonData(value, "Lorcan02.1");
            setIsLoading(false);
          })
          .catch(() => {
            setIsLoading(false);
          });
      });
  };

  return isDemoFileButtonVisible ? (
    <Button variant="contained" color="success" onClick={loadDemoFile} disabled={isLoading}>
      {isLoading ? <CircularProgress /> : "Demo file"}
    </Button>
  ) : null;
};
