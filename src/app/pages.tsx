import { Link, useParams } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import unfurlLogo from "@/assets/unfurl-logo.png";
import ItchIoLogo from "@/assets/itchio-logo.svg";
import { DemoButton } from "@/features/demo";
import { DialogViewer } from "@/features/dialog-viewer";
import { DownloadButton } from "@/features/download";
import { FileUpload } from "@/features/file-upload";
import { useFaqModal } from "@/features/faq";
import { MetadataConfig } from "@/features/metadata-config";
import { NodeEditor } from "@/features/node-editor";
import { getEditableFile } from "@/features/recent-files";
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

export const FilePage = () => {
  const { fileId } = useParams({ strict: false }) as { fileId?: string };
  const name = useJsonDataStore((state) => state.name);
  const activeFileId = useJsonDataStore((state) => state.activeFileId);
  const setJsonData = useJsonDataStore((state) => state.setJson);
  const resetJson = useJsonDataStore((state) => state.reset);
  const node = useNodeStore((state) => state.node);
  const setSelectedNode = useNodeStore((state) => state.setNode);
  const [isMissing, setIsMissing] = useState(false);

  useEffect(() => {
    if (!fileId) return;
    const file = getEditableFile(fileId);
    if (!file) {
      setIsMissing(true);
      resetJson();
      setSelectedNode(null);
      return;
    }
    setIsMissing(false);
    setSelectedNode(null);
    setJsonData(file.content, file.name, file.id);
  }, [fileId, resetJson, setJsonData, setSelectedNode]);

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
      <div className="flex shrink-0 items-center justify-between gap-4 border-b bg-background/95 px-4 py-3">
        <div className="min-w-0 text-left">
          <p className="text-sm uppercase tracking-wide text-muted-foreground">
            Editing
          </p>
          <h1 className="truncate text-3xl font-bold">{name || "Untitled"}</h1>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <DownloadButton />
          <Button asChild variant="secondary">
            <Link to="/">Upload another file</Link>
          </Button>
        </div>
      </div>
      <section className="relative min-h-0 flex-1 overflow-hidden">
        <DialogViewer />
        {node ? (
          <aside className="absolute right-4 top-4 z-10 w-[calc(100%-2rem)] sm:w-[28rem]">
            <NodeEditor />
          </aside>
        ) : null}
      </section>
    </div>
  );
};
