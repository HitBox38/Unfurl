import type { SpellcheckContextMenuPayload } from "@/shared/types";

export const hasSpellcheckActions = ({
  dictionarySuggestions,
  misspelledWord,
}: SpellcheckContextMenuPayload) =>
  dictionarySuggestions.length > 0 || Boolean(misspelledWord);

export const openContextMenuAt = (
  trigger: HTMLElement,
  { x, y }: SpellcheckContextMenuPayload,
) => {
  trigger.style.left = `${x}px`;
  trigger.style.top = `${y}px`;
  const ContextMenuEvent =
    typeof PointerEvent === "undefined" ? MouseEvent : PointerEvent;
  trigger.dispatchEvent(
    new ContextMenuEvent("contextmenu", {
      bubbles: true,
      button: 2,
      buttons: 2,
      cancelable: true,
      clientX: x,
      clientY: y,
      pointerType: "mouse",
    }),
  );
};

export const sendSpellcheckCommand = (channel: string, value: string) => {
  window.ipcRenderer?.send(channel, value);
};
