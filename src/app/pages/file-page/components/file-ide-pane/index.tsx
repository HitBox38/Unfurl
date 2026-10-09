import { Activity, lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import * as m from "motion/react-m";

import { TabsContent } from "@/shared/ui/tabs";
import { useIdeVisibility } from "@/app/pages/file-page/hooks/use-ide-visibility";

const LazyStoryIde = lazy(() => import("@/features/story-ide"));

export const FileIdePane = ({
  active,
  fileId,
  opened,
}: {
  active: boolean;
  fileId: string;
  opened: boolean;
}) => {
  const { visible, animationProps } = useIdeVisibility(active);
  return (
    <TabsContent
      value="ide"
      forceMount
      hidden={!visible}
      inert={!active}
      aria-hidden={!active || undefined}
      className="absolute inset-0 z-10 m-0 min-h-0 data-[state=inactive]:pointer-events-none"
    >
      <m.div {...animationProps} className="h-full min-h-0 px-4 pb-4">
        {opened || active ? (
          <Activity mode={visible ? "visible" : "hidden"}>
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <Loader2 className="animate-spin" aria-label="Loading story IDE" />
                </div>
              }
            >
              <LazyStoryIde key={fileId} fileId={fileId} />
            </Suspense>
          </Activity>
        ) : null}
      </m.div>
    </TabsContent>
  );
};
