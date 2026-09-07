import { Link, Outlet } from "@tanstack/react-router";
import { useHotkeySequence } from "@tanstack/react-hotkeys";

import UnfurlMark from "@/assets/unfurl-mark.svg?react";
import { EveryWhereDialog } from "@/shared/components";
import { useFaqModal } from "@/features/faq";
import { RecentFilesSidebar } from "@/features/recent-files-sidebar";
import { SpellcheckContextMenu } from "@/features/spellcheck-context-menu";
import { cn } from "@/shared/lib/cn";
import { useDialogStore } from "@/shared/stores";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/ui/sidebar";
import { TooltipProvider } from "@/shared/ui/tooltip";

const isElectronRenderer = () =>
  typeof window !== "undefined" && Boolean(window.ipcRenderer);

const AppBar = ({ isElectron }: { isElectron: boolean }) => (
  <header
    className={
      isElectron
        ? "electron-titlebar-drag-region z-50 flex items-center gap-1 px-2"
        : "relative z-20 flex h-8 shrink-0 items-center gap-1 border-b bg-sidebar px-2 text-sidebar-foreground"
    }
  >
    <SidebarTrigger
      aria-label="Toggle sidebar"
      className={cn("text-sidebar-foreground", isElectron && "electron-titlebar-no-drag")}
    />
    <Link
      to="/"
      aria-label="Go to home page"
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md font-heading text-sm font-medium outline-none hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
        isElectron && "electron-titlebar-no-drag",
      )}
    >
      <UnfurlMark
        aria-hidden="true"
        focusable="false"
        className="size-5 shrink-0 text-primary dark:text-chart-1"
      />
      Unfurl
    </Link>
  </header>
);

const App = () => {
  const setContent = useDialogStore((state) => state.setContent);
  const faqModal = useFaqModal();
  const isElectron = isElectronRenderer();
  const shellClassName = isElectron
    ? "app-shell electron-app-shell h-svh overflow-hidden"
    : "app-shell h-svh overflow-hidden";

  useHotkeySequence(["Control+C", "Control+F"], () => setContent(faqModal), {
    ignoreInputs: false,
    preventDefault: false,
    stopPropagation: false,
    timeout: Number.POSITIVE_INFINITY,
  });

  return (
    <TooltipProvider>
      <div className={shellClassName} data-testid="app-shell">
        <SidebarProvider className="flex h-full min-h-0 flex-col">
          {isElectron ? (
            <div className="h-0 overflow-visible">
              <AppBar isElectron />
            </div>
          ) : (
            <AppBar isElectron={false} />
          )}
          <div
            className={
              isElectron
                ? "electron-sidebar-layout flex min-h-0"
                : "flex min-h-0 min-w-0 flex-1"
            }
            data-testid="app-sidebar-layout"
          >
            <RecentFilesSidebar />
            <SidebarInset className="min-h-0 min-w-0">
              <Outlet />
            </SidebarInset>
          </div>
        </SidebarProvider>
        <EveryWhereDialog />
        <SpellcheckContextMenu />
      </div>
    </TooltipProvider>
  );
};

export default App;
