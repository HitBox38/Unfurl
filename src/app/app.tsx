import { Outlet } from "@tanstack/react-router";

import { useKeyboardShortcut } from "@/shared/hooks";
import { EveryWhereDialog } from "@/shared/components";
import { useDialogStore } from "@/shared/stores";
import { RecentFilesSidebar } from "@/features/recent-files";
import { useFaqModal } from "@/features/faq";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/shared/ui/sidebar";

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
  const sidebarTriggerClassName = isElectron
    ? "electron-sidebar-trigger fixed left-2 z-40"
    : "fixed left-2 top-2 z-40";

  useKeyboardShortcut(() => setContent(faqModal), {
    codes: ["KeyC", "KeyF"],
    ctrlKey: true,
  });

  return (
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
        <SidebarInset className="min-w-0">
          <div className={sidebarTriggerClassName}>
            <SidebarTrigger aria-label="Toggle editable files sidebar" />
          </div>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
      <EveryWhereDialog />
    </div>
  );
};

export default App;
