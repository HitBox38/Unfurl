import { Outlet } from "@tanstack/react-router";

import { useKeyboardShortcut } from "@/shared/hooks";
import { EveryWhereDialog } from "@/shared/components";
import { useDialogStore } from "@/shared/stores";
import { useFaqModal } from "@/features/faq";
import { RecentFilesSidebar } from "@/features/recent-files";

const isOnlineHost = () =>
  typeof location !== "undefined" &&
  location.hostname.includes(".vercel.app") &&
  location.hostname.includes("unfurl");

const App = () => {
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
      <div className="flex min-h-screen w-full">
        <RecentFilesSidebar />
        <div className="min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
      <EveryWhereDialog />
    </>
  );
};

export default App;
