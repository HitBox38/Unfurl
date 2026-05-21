export const SPELLCHECK_CONTEXT_MENU_CHANNEL = "spellcheck-context-menu";
export const SPELLCHECK_REPLACE_MISSPELLING_CHANNEL =
  "spellcheck:replace-misspelling";
export const SPELLCHECK_ADD_WORD_CHANNEL = "spellcheck:add-word";

export type SpellcheckContextMenuPayload = {
  dictionarySuggestions: string[];
  misspelledWord?: string;
  x: number;
  y: number;
};
