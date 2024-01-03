import { ChangeEvent, useState } from "react";
import { Button, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { UseJsonDataStore } from "../stores/JsonData";
import { converter } from "../functions/converter";

const FileUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { name, setJson: setJsonData } = UseJsonDataStore((state) => state);
  const [fileType, setFileType] = useState<"twee" | "json">("twee");

  const handleTypeChange = (event: SelectChangeEvent) =>
    setFileType(event.target.value as "twee" | "json");

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectFile = e.target.files ? e.target.files[0] : null;

    if (
      selectFile &&
      selectFile.name.split(".")[selectFile.name.split(".").length - 1] === fileType
    ) {
      setFile(selectFile);
    } else {
      alert(`Please upload a .${fileType} file`);
    }
  };

  const onFileUpload = () => {
    if (file) {
      setIsLoading(true);

      if (fileType === "twee") {
        converter(file).then((value) => {
          console.log(value);

          if (name !== "") {
            setJsonData({ nodes: [], start: null, title: null }, "");
          }
          if (value) {
            setJsonData(value, file.name.split(".")[0]);
          }
          setIsLoading(false);
        });
      } else if (fileType === "json") {
        file.text().then((value) => {
          console.log(JSON.parse(value));

          setJsonData(JSON.parse(value), file.name.split(".")[0]);
        });
      }
    }
  };

  return (
    <div>
      <Select value={fileType} onChange={handleTypeChange}>
        <MenuItem value="twee">Twee</MenuItem>
        <MenuItem value="json">JSON</MenuItem>
      </Select>
      <input type="file" onChange={onFileChange} accept={`.${fileType}`} />
      <Button variant="contained" disabled={isLoading} onClick={onFileUpload}>
        {isLoading ? (
          <svg
            width="13"
            height="14"
            viewBox="0 0 13 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4.38798 12.616C3.36313 12.2306 2.46328 11.5721 1.78592 10.7118C1.10856 9.85153 0.679515 8.82231 0.545268 7.73564C0.411022 6.64897 0.576691 5.54628 1.02433 4.54704C1.47197 3.54779 2.1845 2.69009 3.08475 2.06684C3.98499 1.4436 5.03862 1.07858 6.13148 1.01133C7.22435 0.944078 8.31478 1.17716 9.28464 1.68533C10.2545 2.19349 11.0668 2.95736 11.6336 3.89419C12.2004 4.83101 12.5 5.90507 12.5 7"
              stroke="white"
            />
          </svg>
        ) : (
          "Upload"
        )}
      </Button>
    </div>
  );
};

export default FileUpload;
