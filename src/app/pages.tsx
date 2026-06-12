import { Link, useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import unfurlLogo from "@/assets/unfurl-logo.png";
import ItchIoLogo from "@/assets/itchio-logo.svg";
import { DemoButton } from "@/features/demo";
import { DialogViewer } from "@/features/dialog-viewer";
import { useDialogViewerUiStore } from "@/features/dialog-viewer/hooks/use-dialog-viewer-ui-store";
import { GraphNodeToolbar } from "@/features/graph-node-toolbar";
import { DownloadButton } from "@/features/download";
import { FileHistoryControls } from "@/features/file-history";
import { FileUpload } from "@/features/file-upload";
import { useFaqModal } from "@/features/faq";
import { MetadataConfig } from "@/features/metadata-config";
import { NodeEditor } from "@/features/node-editor";
import { getEditableFile } from "@/shared/lib/editable-files-storage";
import {
  useDialogStore,
  useJsonDataStore,
  useNodeStore,
} from "@/shared/stores";
import { Button } from "@/shared/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";

interface PageProps {
  isOnline: boolean;
}

const EmptyAppHero = ({ isOnline }: PageProps) => (
  <>
    <img
      src={unfurlLogo}
      alt="Unfurl logo"
      aria-label="logo"
      className="mx-auto h-32 p-6 transition-[filter] duration-300 [will-change:filter] hover:[filter:drop-shadow(0_0_2em_#646cffaa)]"
    />
    <h1 className="text-4xl font-bold">Unfurl{isOnline ? " Online" : ""}</h1>
    <h2 className="box-content flex h-[27px] flex-row justify-center text-2xl">
      <span className="overflow-hidden">
        <span className="rotator-span">Twee</span>
        <span className="rotator-span">Obsidian</span>
        <span className="rotator-span">md</span>
        <span className="rotator-span">JSON</span>
        <span className="rotator-span">Twee</span>
      </span>
      <span className="ml-2">Convertor & Editor</span>
    </h2>
  </>
);

export const HomePage = ({ isOnline }: PageProps) => {
  const setContent = useDialogStore((state) => state.setContent);
  const resetJson = useJsonDataStore((state) => state.reset);
  const setSelectedNode = useNodeStore((state) => state.setNode);
  const faqModal = useFaqModal();

  useEffect(() => {
    resetJson();
    setSelectedNode(null);
  }, [resetJson, setSelectedNode]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-6">
      <EmptyAppHero isOnline={isOnline} />
      <FileUpload />
      <section className="flex flex-col items-center gap-4 pb-8">
        <MetadataConfig />
        <DemoButton />
        {isOnline ? (
          <Button asChild variant="secondary">
            <a
              href="https://hit-box38.itch.io/unfurl"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2"
            >
              <ItchIoLogo />
              <span>Get the Desktop version</span>
            </a>
          </Button>
        ) : null}
        <Button variant="info" onClick={() => setContent(faqModal)}>
          FAQ
        </Button>
      </section>
    </div>
  );
};

interface FileNameHeaderInputProps {
  name: string;
  onCommit: (name: string) => void;
}

const FileNameHeaderInput = ({ name, onCommit }: FileNameHeaderInputProps) => {
  const displayName = name || "Untitled";
  const [draftName, setDraftName] = useState(displayName);

  const commitName = (value: string) => {
    const nextName = value.trim();
    if (!nextName) {
      setDraftName(displayName);
      return;
    }

    if (nextName !== name) {
      onCommit(nextName);
    }
    setDraftName(nextName);
  };

  return (
    <div className="min-w-0 flex-1 text-left">
      <Label htmlFor="file-name" className="sr-only">
        File name
      </Label>
      <Input
        id="file-name"
        aria-label="File name"
        value={draftName}
        onChange={(event) => setDraftName(event.target.value)}
        onBlur={(event) => commitName(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            event.currentTarget.blur();
          }
        }}
        className="h-auto w-full truncate rounded-full border border-transparent bg-transparent px-2 py-0 text-3xl font-bold leading-tight shadow-none ring-0 hover:border-input hover:bg-background/60 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 md:text-3xl dark:bg-transparent"
      />
    </div>
  );
};

export const FilePage = () => {
  const { fileId } = useParams({ strict: false }) as { fileId?: string };
  const name = useJsonDataStore((state) => state.name);
  const activeFileId = useJsonDataStore((state) => state.activeFileId);
  const content = useJsonDataStore((state) => state.content);
  const setJsonData = useJsonDataStore((state) => state.setJson);
  const setFileName = useJsonDataStore((state) => state.setName);
  const resetJson = useJsonDataStore((state) => state.reset);
  const node = useNodeStore((state) => state.node);
  const setSelectedNode = useNodeStore((state) => state.setNode);
  const [isMissing, setIsMissing] = useState(false);
  const previousContentNodesRef = useRef(content.nodes);

  useEffect(() => {
    if (!fileId) return;
    const file = getEditableFile(fileId);
    if (!file) {
      setIsMissing(true);
      resetJson();
      setSelectedNode(null);
      useDialogViewerUiStore.getState().reset();
      return;
    }
    setIsMissing(false);
    setSelectedNode(null);
    useDialogViewerUiStore.getState().reset();
    setJsonData(file.content, file.name, file.id);
  }, [fileId, resetJson, setJsonData, setSelectedNode]);

  useEffect(() => {
    const previousNodes = previousContentNodesRef.current;
    previousContentNodesRef.current = content.nodes;
    if (!node) return;

    const matchingNode = content.nodes.find(
      (storyNode) => storyNode.name === node.name,
    );
    const previousNodeIndex = previousNodes.findIndex(
      (storyNode) => storyNode.name === node.name,
    );
    const selectedNode = matchingNode ?? content.nodes[previousNodeIndex];
    if (!selectedNode) {
      setSelectedNode(null);
      return;
    }
    if (selectedNode !== node) {
      setSelectedNode(selectedNode);
    }
  }, [content.nodes, node, setSelectedNode]);

  if (isMissing) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-md text-left">
          <CardHeader>
            <CardTitle>File not found</CardTitle>
            <CardDescription>
              This editable file is no longer available in localStorage.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/">Upload a file</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!fileId || activeFileId !== fileId) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin" aria-label="Loading editable file" />
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <section className="relative min-h-0 flex-1 overflow-hidden">
        <div
          data-testid="file-page-header"
          className="absolute left-4 top-4 z-10 flex max-w-[calc(100%-15rem)] items-center rounded-full border bg-card/90 px-2.5 py-1.5 shadow-lg backdrop-blur-md sm:max-w-[min(36rem,calc(100%-15rem))]"
        >
          <FileNameHeaderInput
            key={name || "Untitled"}
            name={name}
            onCommit={setFileName}
          />
        </div>
        <div
          data-testid="file-toolbar"
          className="absolute right-4 top-4 z-10 flex items-center gap-2"
        >
          <div
            data-testid="file-history-bubble"
            className="rounded-full border bg-card/90 p-1.5 shadow-lg backdrop-blur-md"
          >
            <FileHistoryControls />
          </div>
          <div
            data-testid="file-add-node-bubble"
            className="rounded-full border bg-card/90 p-1.5 shadow-lg backdrop-blur-md"
          >
            <GraphNodeToolbar />
          </div>
          <div
            data-testid="file-download-bubble"
            className="rounded-full border bg-card/90 p-1.5 shadow-lg backdrop-blur-md"
          >
            <DownloadButton />
          </div>
        </div>
        <DialogViewer />
        {node ? (
          <aside className="absolute right-4 top-16 z-10 w-[calc(100%-2rem)] sm:w-[28rem]">
            <NodeEditor />
          </aside>
        ) : null}
      </section>
    </div>
  );
};
