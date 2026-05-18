import { Loader2 } from "lucide-react";

import unfurlLogo from "@/assets/unfurl-logo.png";
import ItchIoLogo from "@/assets/itchio-logo.svg";
import { useKeyboardShortcut } from "@/shared/hooks";
import { EveryWhereDialog } from "@/shared/components";
import {
  useDialogStore,
  useJsonDataStore,
  useNodeStore,
} from "@/shared/stores";
import { Button } from "@/shared/ui/button";

import { DemoButton } from "@/features/demo";
import { DialogViewer } from "@/features/dialog-viewer";
import { DownloadButton } from "@/features/download";
import { useFaqModal } from "@/features/faq";
import { FileUpload } from "@/features/file-upload";
import { MetadataConfig } from "@/features/metadata-config";
import { NodeEditor } from "@/features/node-editor";
import { Open5eSpells } from "@/features/open5e-spells";

const isOnlineHost = () =>
  typeof location !== "undefined" &&
  location.hostname.includes(".vercel.app") &&
  location.hostname.includes("unfurl");

const App = () => {
  const name = useJsonDataStore((state) => state.name);
  const isLoading = useJsonDataStore((state) => state.isLoading);
  const node = useNodeStore((state) => state.node);
  const setContent = useDialogStore((state) => state.setContent);
  const faqModal = useFaqModal();
  const isOnline = isOnlineHost();

  useKeyboardShortcut(() => setContent(faqModal), {
    codes: ["KeyC", "KeyF"],
    ctrlKey: true,
  });

  return (
    <>
      {!isOnline ? (
        <header className="draggable z-50 flex items-center bg-[#3d3d3d] px-3">
          <span className="text-base font-medium">Unfurl</span>
        </header>
      ) : null}
      <img
        src={unfurlLogo}
        alt="Unfurl logo"
        aria-label="logo"
        className="mx-auto h-32 p-6 transition-[filter] duration-300 [will-change:filter] hover:[filter:drop-shadow(0_0_2em_#646cffaa)]"
      />
      <main className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-4xl font-bold">
          Unfurl{isOnline ? " Online" : ""}
        </h1>
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
        {name === "" ? (
          <FileUpload />
        ) : (
          <Button variant="secondary" onClick={() => location.reload()}>
            Upload another file
          </Button>
        )}
        <section className="mx-auto flex w-[80vw] flex-row items-start justify-evenly py-4">
          {name !== "" ? (
            <>
              <DialogViewer />
              {node ? <NodeEditor /> : null}
            </>
          ) : isLoading ? (
            <Loader2 className="animate-spin" />
          ) : null}
        </section>
        {name === "" ? (
          <section className="flex w-full justify-center px-4 py-4">
            <Open5eSpells />
          </section>
        ) : null}
        <section className="flex flex-col items-center gap-4 pb-8">
          {name !== "" ? <DownloadButton /> : <MetadataConfig />}
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
      </main>
      <EveryWhereDialog />
    </>
  );
};

export default App;
