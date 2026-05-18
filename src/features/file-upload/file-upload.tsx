import {
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useState, type ChangeEvent } from "react";

import { useStorage } from "@/shared/hooks";
import { fromMd, fromTwee } from "@/shared/lib/convertors";
import { useJsonDataStore } from "@/shared/stores";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  SUPPORTED_FILE_TYPES,
  type MetadataConfigTemplate,
  type StoryData,
  type SupportedFileType,
} from "@/shared/types";

const FILE_TYPE_LABEL: Record<SupportedFileType, string> = {
  twee: "Twee",
  json: "JSON",
  md: "Obsidian (md)",
};

const fileExtension = (file: File): string => {
  const parts = file.name.split(".");
  return parts[parts.length - 1];
};

export const FileUpload = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileType, setFileType] = useState<SupportedFileType>("twee");
  const [caughtError, setCaughtError] = useState<string | null>(null);
  const currentName = useJsonDataStore((state) => state.name);
  const setJsonData = useJsonDataStore((state) => state.setJson);

  const [{ config }] = useStorage<MetadataConfigTemplate>({
    key: "metadataConfig",
    defaultValue: { config: [] },
  });

  useEffect(() => {
    setFiles([]);
  }, [fileType]);

  const handleTypeChange = (value: string) =>
    setFileType(value as SupportedFileType);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCaughtError(null);
    const selectedFiles = e.target.files ? Array.from(e.target.files) : null;
    if (
      !selectedFiles ||
      !selectedFiles.every((file) => fileExtension(file) === fileType)
    ) {
      alert(`Please upload a .${fileType} file`);
      return;
    }
    if (fileType === "md") {
      setFiles((prev) => [...prev, ...selectedFiles]);
    } else {
      setFiles([selectedFiles[0]]);
    }
  };

  const onFileUpload = async () => {
    if (files.length === 0) return;
    setCaughtError(null);
    setIsLoading(true);
    try {
      if (fileType === "twee") {
        const data = await fromTwee(files[0]);
        if (currentName !== "") {
          setJsonData({ nodes: [], start: null, title: null }, "");
        }
        setJsonData(data, files[0].name.split(".")[0]);
      } else if (fileType === "md") {
        const data = await fromMd(files, title);
        if (currentName !== "") {
          setJsonData({ nodes: [], start: null, title: null }, "");
        }
        setJsonData(data, title);
      } else if (fileType === "json") {
        const text = await files[0].text();
        const json = JSON.parse(text) as StoryData;
        json.nodes = json.nodes.map((node) => {
          const keys = Object.keys(node.metadata);
          let extras: Record<string, number | boolean> = {};
          for (const configItem of config) {
            if (keys.findIndex((key) => configItem.name === key) === -1) {
              extras = {
                ...extras,
                [configItem.name]: configItem.type === "boolean" ? false : 0,
              };
            }
          }
          return {
            ...node,
            metadata: { ...node.metadata, ...extras },
          };
        });
        setJsonData(json, files[0].name.split(".")[0]);
      }
    } catch (error) {
      setCaughtError(error instanceof Error ? error.message : String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const uploadDisabled =
    isLoading ||
    files.length === 0 ||
    files.some((file) => fileExtension(file) !== fileType);

  const inputLabelText =
    fileType === "md"
      ? "Select .md files"
      : `Select a .${fileType} file`;

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex items-center justify-center gap-6">
        <Select value={fileType} onValueChange={handleTypeChange}>
          <SelectTrigger
            className="w-[150px] text-left"
            aria-label="File type"
          >
            <SelectValue placeholder="File type" />
          </SelectTrigger>
          <SelectContent>
            {SUPPORTED_FILE_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {FILE_TYPE_LABEL[type]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button asChild>
          <label className="cursor-pointer">
            <Upload className="size-4" />
            <span>{inputLabelText}</span>
            <input
              type="file"
              onChange={onFileChange}
              multiple={fileType === "md"}
              accept={`.${fileType}`}
              className="sr-only"
              aria-label={inputLabelText}
            />
          </label>
        </Button>
        <Button
          variant="secondary"
          onClick={onFileUpload}
          disabled={uploadDisabled}
        >
          {isLoading ? <Loader2 className="animate-spin" /> : "Upload"}
        </Button>
      </div>
      {fileType === "md" ? (
        <Input
          placeholder="What is the title of this dialog?"
          className="w-[350px]"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      ) : null}
      {files.length > 0 ? (
        <div className="flex max-w-3xl flex-wrap items-center justify-center gap-2">
          {files.map((file, index) => (
            <Badge
              key={file.lastModified ?? `${file.name}-${index}`}
              variant="secondary"
              className="px-3 py-1"
            >
              <FileText className="size-3" />
              <span>{file.name}</span>
              <button
                type="button"
                onClick={() =>
                  setFiles((prev) => prev.filter((_, i) => i !== index))
                }
                aria-label={`Remove ${file.name}`}
                className="ml-1 inline-flex items-center text-destructive hover:opacity-80"
              >
                <Trash2 className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      ) : null}
      {caughtError ? (
        <p className="max-w-sm rounded-lg bg-warning/80 p-2 font-bold text-destructive">
          {caughtError}
        </p>
      ) : null}
    </div>
  );
};
