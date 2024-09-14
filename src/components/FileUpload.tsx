import { ChangeEvent, useState } from "react";
import {
  Box,
  Button,
  Chip,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from "@mui/material";
import { UseJsonDataStore } from "../stores/JsonData";
import { fromTwee } from "../functions/convertors/fromTwee";
import { StoryData } from "../interfaces/StoryData";
import useLocalStorage from "../hooks/useLocalStorage";
import { MetadataConfigTemplate } from "../interfaces/MetadataConfigTemplate";
import { SupportedFileTypes } from "../interfaces/SupportedFileTypes";
import { fromMd } from "../functions/convertors/fromMd";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/Delete";

const FileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { name, setJson: setJsonData } = UseJsonDataStore((state) => state);
  const [fileType, setFileType] = useState<SupportedFileTypes>("twee");
  const [caughtError, setCaughtError] = useState<string | null>(null);

  const [{ config }] = useLocalStorage<MetadataConfigTemplate>("metadataConfig", {
    config: [],
  });

  const handleTypeChange = (event: SelectChangeEvent) =>
    setFileType(event.target.value as SupportedFileTypes);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCaughtError(null);
    const selectFiles = e.target.files ? Array.from(e.target.files) : null;

    if (
      selectFiles &&
      selectFiles.every(
        (selectedFile) =>
          selectedFile.name.split(".")[selectedFile.name.split(".").length - 1] === fileType
      )
    ) {
      if (fileType === "md") {
        setFiles((prev) => [...prev, ...selectFiles]);
      } else {
        setFiles([selectFiles[0]]);
      }
    } else {
      alert(`Please upload a .${fileType} file`);
    }
  };

  const onFileUpload = () => {
    if (files) {
      setCaughtError(null);
      setIsLoading(true);
      switch (fileType) {
        case "twee":
          fromTwee(files[0])
            .then((value) => {
              if (name !== "") {
                setJsonData({ nodes: [], start: null, title: null }, "");
              }

              setJsonData(value, files[0].name.split(".")[0]);

              setIsLoading(false);
            })
            .catch((error) => {
              setCaughtError(error.message);
              setIsLoading(false);
            });
          break;

        case "md":
          fromMd(files, title)
            .then((storyData) => {
              if (name !== "") {
                setJsonData({ nodes: [], start: null, title: null }, "");
              }

              setJsonData(storyData, title);

              setIsLoading(false);
            })
            .catch((error) => {
              setCaughtError(error.message);
              setIsLoading(false);
            });
          break;

        case "json":
          files[0]
            .text()
            .then((value) => {
              const json = JSON.parse(value) as StoryData;
              json.nodes = json.nodes.map((node) => {
                const keys = Object.keys(node.metadata);
                let completeMetadata = {};
                config.forEach((configItem) => {
                  if (keys.findIndex((key) => configItem.name === key) === -1) {
                    completeMetadata = {
                      ...completeMetadata,
                      [configItem.name]: configItem.type === "boolean" ? false : 0,
                    };
                  }
                });
                return {
                  ...node,
                  metadata: {
                    ...node.metadata,
                    ...completeMetadata,
                  },
                };
              });

              setJsonData(json, files[0].name.split(".")[0]);

              setIsLoading(false);
            })
            .catch((error) => {
              setCaughtError(error.message);
              setIsLoading(false);
            });
          break;
      }
    }
  };

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      rowGap="8px">
      <Box display="flex" justifyContent="center" alignItems="center" columnGap="8px">
        <Select
          value={fileType}
          onChange={handleTypeChange}
          size="medium"
          sx={{ textAlign: "left", width: "150px" }}
          label="File Type">
          <MenuItem value="twee">Twee</MenuItem>
          <MenuItem value="json">JSON</MenuItem>
          <MenuItem value="md">Obsidian (md)</MenuItem>
        </Select>
        <Button>
          <input
            type="file"
            onChange={onFileChange}
            multiple={fileType === "md"}
            accept={`.${fileType}`}
          />
        </Button>
        <Button
          variant="contained"
          disabled={
            isLoading ||
            files.every(
              (file) => file.name.split(".")[file.name.split(".").length - 1] !== fileType
            )
          }
          onClick={onFileUpload}>
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
      </Box>
      {fileType === "md" && (
        <TextField
          placeholder="What is the title of this dialog?"
          sx={{ width: "350px" }}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      )}
      <Box display="flex" justifyContent="center" alignItems="center" columnGap="8px">
        {files.length > 0 &&
          files.map((f, index) => (
            <Chip
              icon={<DescriptionIcon />}
              variant="filled"
              label={f.name}
              onDelete={() => setFiles((prev) => prev.filter((_file, i) => i !== index))}
              deleteIcon={<DeleteIcon />}
              key={f.lastModified}
            />
          ))}
      </Box>
      {caughtError ? (
        <Typography
          variant="caption"
          sx={{
            color: ({ palette }) => palette.error.main,
            background: ({ palette }) => palette.warning.light,
            fontWeight: ({ typography }) => typography.fontWeightBold,
            padding: ({ spacing }) => spacing(1),
            borderRadius: "10px",
            maxWidth: "350px",
          }}>
          {caughtError}
        </Typography>
      ) : null}
    </Box>
  );
};

export default FileUpload;
