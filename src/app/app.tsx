import { Settings } from "@/features/settings";
import { useSidebarStartup } from "@/features/settings/hooks/use-sidebar-startup";
import { useThemeSync } from "@/shared/hooks/use-theme";
import { Link, Outlet } from "@tanstack/react-router";
import { useHotkey } from "@tanstack/react-hotkeys";
import type { CSSProperties } from "react";

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
  useSidebar,
} from "@/shared/ui/sidebar";
import { TooltipProvider } from "@/shared/ui/tooltip";

const isElectronRenderer = () =>
  typeof window !== "undefined" && Boolean(window.ipcRenderer);

const AppNavigation = ({
  isElectron = false,
  inSidebar = false,
}: {
  isElectron?: boolean;
  inSidebar?: boolean;
}) => {
  const { setOpenMobile } = useSidebar();

  return (
    <>
      <SidebarTrigger
        aria-label="Toggle sidebar"
        className={cn(
          "text-sidebar-foreground",
          inSidebar && "shrink-0",
          isElectron && "electron-titlebar-no-drag",
        )}
      />
      <Link
        to="/"
        aria-label="Go to home page"
        onClick={() => setOpenMobile(false)}
        className={cn(
          "inline-flex items-center gap-2.5 rounded-xl font-heading text-base font-medium outline-none hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring",
          inSidebar && "min-h-7 shrink-0 justify-center",
          isElectron && "electron-titlebar-no-drag",
        )}
      >
        <UnfurlMark
          aria-hidden="true"
          focusable="false"
          className="size-6 shrink-0 text-primary dark:text-chart-1"
        />
        <span
          className={cn(inSidebar && "group-data-[collapsible=icon]:hidden")}
        >
          Unfurl
        </span>
      </Link>
    </>
  );
};

const App = () => {
  const setContent = useDialogStore((state) => state.setContent);
  const faqModal = useFaqModal();
  const isElectron = isElectronRenderer();
  useThemeSync();
  const [sidebarOpen, setSidebarOpen] = useSidebarStartup(isElectron);
  const shellClassName = isElectron
    ? "app-shell electron-app-shell h-svh overflow-hidden"
    : "app-shell h-svh overflow-hidden";

  useHotkey("F1", () => setContent(faqModal), {
    ignoreInputs: false,
    preventDefault: true,
  });

  return (
    <TooltipProvider>
      <div className={shellClassName} data-testid="app-shell">
        <SidebarProvider
          open={sidebarOpen}
          onOpenChange={setSidebarOpen}
          className="flex h-full min-h-0 flex-col"
          style={{ "--sidebar-width": "18rem" } as CSSProperties}
        >
          <Settings desktop={isElectron}>
            {isElectron ? (
              <div className="h-0 overflow-visible">
                <header className="electron-titlebar-drag-region z-50 flex items-center gap-1 px-2">
                  <AppNavigation isElectron />
                </header>
              </div>
            ) : (
              <header className="relative z-20 flex h-12 shrink-0 items-center gap-1 border-b bg-sidebar px-2 text-sidebar-foreground md:hidden">
                <AppNavigation />
              </header>
            )}
            <div
              className={
                isElectron
                  ? "electron-sidebar-layout flex min-h-0"
                  : "flex min-h-0 min-w-0 flex-1"
              }
              data-testid="app-sidebar-layout"
            >
              <RecentFilesSidebar
                navigation={
                  !isElectron ? <AppNavigation inSidebar /> : undefined
                }
              />
              <SidebarInset className="min-h-0 min-w-0 bg-transparent">
                <Outlet />
              </SidebarInset>
            </div>
          </Settings>
        </SidebarProvider>
        <EveryWhereDialog />
        <SpellcheckContextMenu />
      </div>
    </TooltipProvider>
  );
};

export default App;
