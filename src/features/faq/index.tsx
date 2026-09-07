import type { DialogContent } from "@/shared/stores";

import { FaqContent } from "./components/faq-content";

export const useFaqModal = (): DialogContent => ({
  isOpen: true,
  title: "FAQ",
  description: "Import, edit, and export branching dialog.",
  functions: [],
  classNames: {
    dialog: "sm:max-w-lg",
  },
  content: <FaqContent />,
});
