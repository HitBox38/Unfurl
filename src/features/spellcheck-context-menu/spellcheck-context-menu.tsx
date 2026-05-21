import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { IpcRendererEvent } from "electron";

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/shared/ui/context-menu";
import {
  SPELLCHECK_ADD_WORD_CHANNEL,
  SPELLCHECK_CONTEXT_MENU_CHANNEL,
  SPELLCHECK_REPLACE_MISSPELLING_CHANNEL,
  type SpellcheckContextMenuPayload,
} from "@/shared/types";

const hasSpellcheckActions = ({
  dictionarySuggestions,
  misspelledWord,
}: SpellcheckContextMenuPayload) =>
  dictionarySuggestions.length > 0 || Boolean(misspelledWord);

const openContextMenuAt = (
  trigger: HTMLElement,
  { x, y }: SpellcheckContextMenuPayload,
) => {
  trigger.style.left = `${x}px`;
  trigger.style.top = `${y}px`;
  trigger.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      button: 2,
      buttons: 2,
      cancelable: true,
      clientX: x,
      clientY: y,
    }),
  );
};

const sendSpellcheckCommand = (channel: string, value: string) => {
  window.ipcRenderer?.send(channel, value);
};

const AddToDictionaryItem = ({ word }: { word: string }) => (
  <ContextMenuItem
    onSelect={() => sendSpellcheckCommand(SPELLCHECK_ADD_WORD_CHANNEL, word)}
  >
    Add to dictionary
  </ContextMenuItem>
);

const SpellcheckContextMenu = () => {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const [payload, setPayload] = useState<SpellcheckContextMenuPayload | null>(
    null,
  );
  const [openRequestId, setOpenRequestId] = useState(0);

  useEffect(() => {
    const ipcRenderer = window.ipcRenderer;

    if (!ipcRenderer) {
      return;
    }

    const handleContextMenu = (
      _event: IpcRendererEvent,
      nextPayload: SpellcheckContextMenuPayload,
    ) => {
      if (!hasSpellcheckActions(nextPayload)) {
        setPayload(null);
        return;
      }

      setPayload(nextPayload);
      setOpenRequestId((requestId) => requestId + 1);
    };

    ipcRenderer.on(SPELLCHECK_CONTEXT_MENU_CHANNEL, handleContextMenu);

    return () => {
      ipcRenderer.removeListener(
        SPELLCHECK_CONTEXT_MENU_CHANNEL,
        handleContextMenu,
      );
    };
  }, []);

  useLayoutEffect(() => {
    if (!payload || openRequestId === 0 || !triggerRef.current) {
      return;
    }

    openContextMenuAt(triggerRef.current, payload);
  }, [openRequestId, payload]);

  return (
    <ContextMenu onOpenChange={(open) => !open && setPayload(null)}>
      <ContextMenuTrigger asChild>
        <span
          aria-hidden="true"
          className="pointer-events-none fixed size-px opacity-0"
          ref={triggerRef}
        />
      </ContextMenuTrigger>
      {payload ? (
        <ContextMenuContent className="w-56">
          {payload.dictionarySuggestions.map((suggestion) => (
            <ContextMenuItem
              key={suggestion}
              onSelect={() =>
                sendSpellcheckCommand(
                  SPELLCHECK_REPLACE_MISSPELLING_CHANNEL,
                  suggestion,
                )
              }
            >
              {suggestion}
            </ContextMenuItem>
          ))}
          {payload.dictionarySuggestions.length > 0 && payload.misspelledWord ? (
            <ContextMenuSeparator />
          ) : null}
          {payload.misspelledWord ? (
            <AddToDictionaryItem word={payload.misspelledWord} />
          ) : null}
        </ContextMenuContent>
      ) : null}
    </ContextMenu>
  );
};

export { SpellcheckContextMenu };
