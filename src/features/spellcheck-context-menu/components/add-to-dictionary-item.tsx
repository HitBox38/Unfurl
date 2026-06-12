import { ContextMenuItem } from "@/shared/ui/context-menu";
import { SPELLCHECK_ADD_WORD_CHANNEL } from "@/shared/types";

import { sendSpellcheckCommand } from "../helpers";

interface Props {
  word: string;
}

export const AddToDictionaryItem = ({ word }: Props) => (
  <ContextMenuItem
    onSelect={() => sendSpellcheckCommand(SPELLCHECK_ADD_WORD_CHANNEL, word)}
  >
    Add to dictionary
  </ContextMenuItem>
);
