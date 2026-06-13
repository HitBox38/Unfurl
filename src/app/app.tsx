import { Outlet } from "@tanstack/react-router";
import { useHotkeySequence } from "@tanstack/react-hotkeys";

import { EveryWhereDialog } from "@/shared/components";
import { useDialogStore } from "@/shared/stores";
import { RecentFilesSidebar } from "@/features/recent-files-sidebar";
import { SpellcheckContextMenu } from "@/features/spellcheck-context-menu";
import { useFaqModal } from "@/features/faq";
import {
  SidebarInset,
  SidebarProvider,
} from "@/shared/ui/sidebar";
import { TooltipProvider } from "@/shared/ui/tooltip";

const isElectronRenderer = () =>
  typeof window !== "undefined" && Boolean(window.ipcRenderer);

const App = () => {
  const setContent = useDialogStore((state) => state.setContent);
  const faqModal = useFaqModal();
  const isElectron = isElectronRenderer();
  const shellClassName = isElectron
    ? "electron-app-shell h-svh overflow-hidden"
    : undefined;
  const sidebarLayoutClassName = isElectron
    ? "electron-sidebar-layout min-h-0"
    : undefined;

  useHotkeySequence(["Control+C", "Control+F"], () => setContent(faqModal), {
    ignoreInputs: false,
    preventDefault: false,
    stopPropagation: false,
    timeout: Number.POSITIVE_INFINITY,
  });

  return (
    <TooltipProvider>
    <div className={shellClassName} data-testid="app-shell">
      {isElectron ? (
        <header className="electron-titlebar-drag-region z-50 flex items-center px-3">
          <span className="pointer-events-none select-none text-sm font-medium">
            Unfurl
          </span>
        </header>
      ) : null}
      <SidebarProvider
        className={sidebarLayoutClassName}
        data-testid="app-sidebar-layout"
      >
        <RecentFilesSidebar />
        <SidebarInset className="min-h-0 min-w-0">
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
      <EveryWhereDialog />
      <SpellcheckContextMenu />
    </div>
    </TooltipProvider>
  );
};

export default App;
