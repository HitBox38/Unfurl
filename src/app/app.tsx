import { Outlet } from "@tanstack/react-router";

import { useKeyboardShortcut } from "@/shared/hooks";
import { EveryWhereDialog } from "@/shared/components";
import { useDialogStore } from "@/shared/stores";
import { RecentFilesSidebar } from "@/features/recent-files";
import { useFaqModal } from "@/features/faq";

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
        <header className="draggable z-50 flex items-center bg-[#3d3d3d] px-3">
          <span className="text-base font-medium">Unfurl</span>
        </header>
      ) : null}
      <div className="flex min-h-screen w-full">
        {isElectron ? <RecentFilesSidebar /> : null}
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
      <EveryWhereDialog />
    </>
  );
};

export default App;
