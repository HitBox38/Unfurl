import type { DialogContent } from "@/shared/stores";

import { FaqContent } from "./components/faq-content";

export const useFaqModal = (): DialogContent => ({
  isOpen: true,
  title: "FAQ",
  functions: [],
  classNames: {
    dialogContent: "max-w-[50vw] flex flex-col gap-4",
  },
  content: <FaqContent />,
});
