import { useState } from "react";
import useKeyboardShortcut from "../hooks/useKeyboardShortcut";
import { Button, CircularProgress } from "@mui/material";
import { fromTwee } from "../functions/convertors/fromTwee";
import { useJsonDataStore } from "../stores/JsonData";

export const DemoButton = () => {
  const [isDemoFileButtonVisible, setIsDemoFileButtonVisible] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { setJson: setJsonData } = useJsonDataStore((state) => state);

  useKeyboardShortcut(() => setIsDemoFileButtonVisible((prev) => !prev), {
    codes: ["KeyT", "KeyN"],
    ctrlKey: true,
  });

  const loadDemoFile = () => {
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
    <Button variant="contained" color="success" onClick={() => loadDemoFile()} disabled={isLoading}>
      {isLoading ? <CircularProgress /> : "Demo file"}
    </Button>
  ) : null;
};
