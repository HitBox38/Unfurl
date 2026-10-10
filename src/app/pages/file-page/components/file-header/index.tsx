import { useId } from "react";
import { AnimatePresence, LayoutGroup } from "motion/react";
import * as m from "motion/react-m";

import { DownloadButton } from "@/features/download";
import { FileHistoryControls } from "@/features/file-history";
import { InlineNameInput } from "@/shared/components";
import { useViewMotion } from "@/shared/hooks/use-view-motion";
import { FileViewSwitch } from "@/app/pages/file-page/components/file-view-switch";
import { FileGraphControls } from "@/app/pages/file-page/components/file-graph-controls";
import type { FilePageController } from "@/app/pages/file-page/hooks/use-file-page";

export const FileHeader = ({ page }: { page: FilePageController }) => {
  const { name, setFileName, mode, pending } = page;
  const { layout, spring } = useViewMotion();
  const layoutId = useId();
  return (
    <LayoutGroup id={layoutId}>
      <header className="file-header shrink-0 text-left">
        <m.div
          layout={layout}
          transition={spring}
          data-testid="file-page-header"
          className="file-title-bubble workspace-bubble flex min-h-10 min-w-0 items-center px-3 py-1"
          style={{ borderRadius: 16 }}
        >
          <m.div layout="position" transition={spring} className="min-w-0 flex-1">
            <InlineNameInput
              key={name || "Untitled"}
              id="file-name"
              label="File name"
              name={name}
              onCommit={setFileName}
              className="text-base md:text-base"
            />
          </m.div>
        </m.div>
        <m.div
          layout="position"
          transition={spring}
          data-testid="file-toolbar"
          className="relative flex flex-wrap items-center gap-3"
        >
          <FileViewSwitch mode={mode} />
          <m.div
            layout="position"
            transition={spring}
            data-testid="file-history-bubble"
            className="workspace-bubble workspace-toolbar"
          >
            <FileHistoryControls disabled={pending} />
          </m.div>
          <AnimatePresence initial={false} mode="popLayout">
            {mode === "graph" && !pending ? (
              <FileGraphControls key="graph-controls" />
            ) : null}
          </AnimatePresence>
          <m.div
            layout="position"
            transition={spring}
            data-testid="file-download-bubble"
            className="flex"
          >
            <DownloadButton />
          </m.div>
        </m.div>
      </header>
    </LayoutGroup>
  );
};
