import { ChangeEvent, useEffect, useState } from "react";
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
import styled from "styled-components";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import Loader from "../assets/loader.svg";

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

  useEffect(() => {
    if (fileType) {
      setFiles([]);
    }
  }, [fileType]);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      rowGap="8px">
      <Box display="flex" justifyContent="center" alignItems="center" columnGap="24px">
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
        <Button
          component="label"
          role={undefined}
          variant="contained"
          startIcon={<FileUploadIcon />}>
          Select {fileType !== "md" && "a"} .{fileType} file{fileType === "md" && "s"}
          <VisuallyHiddenInput
            type="file"
            onChange={onFileChange}
            multiple={fileType === "md"}
            accept={`.${fileType}`}
          />
        </Button>
        <Button
          variant="contained"
          color="secondary"
          disabled={
            isLoading ||
            files.every(
              (file) => file.name.split(".")[file.name.split(".").length - 1] !== fileType
            )
          }
          onClick={onFileUpload}>
          {isLoading ? <Loader /> : "Upload"}
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

const VisuallyHiddenInput = styled.input`
  position: absolute;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  height: 1px;
  width: 1px;
  overflow: hidden;
  white-space: nowrap;
  bottom: 0;
  left: 0;
`;

export default FileUpload;
