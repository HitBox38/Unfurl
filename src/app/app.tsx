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

  useKeyboardShortcut(() => setContent(faqModal), {
    codes: ["KeyC", "KeyF"],
    ctrlKey: true,
  });

  return (
    <>
      {isElectron ? (
        <header className="electron-titlebar-drag-region z-50 flex items-center bg-[#3d3d3d] px-3">
          <span className="text-base font-medium">Unfurl</span>
        </header>
      ) : null}
      <SidebarProvider>
        <RecentFilesSidebar />
        <SidebarInset className="min-w-0">
          <div className="fixed left-2 top-2 z-40">
            <SidebarTrigger aria-label="Toggle editable files sidebar" />
          </div>
          <Outlet />
        </SidebarInset>
      </SidebarProvider>
      <EveryWhereDialog />
    </>
  );
};

export default App;
