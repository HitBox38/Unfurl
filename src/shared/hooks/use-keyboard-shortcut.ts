import { useCallback, useEffect, useRef } from "react";

type ModifierKeys = Pick<KeyboardEvent, "altKey" | "ctrlKey" | "shiftKey">;

export interface KeyboardShortcutConfig extends Partial<ModifierKeys> {
  codes: KeyboardEvent["code"][];
  shortcutTarget?: HTMLElement;
}

export type KeyboardShortcutAction = (e: KeyboardEvent) => void;

export const useKeyboardShortcut = (
  shortcutAction: KeyboardShortcutAction,
  config: KeyboardShortcutConfig,
) => {
  const targetElement = config.shortcutTarget ?? document;
  const sequenceIndex = useRef(0);

  const eventHandler = useCallback(
    (e: Event) => {
      const { code, altKey, shiftKey, ctrlKey } = e as KeyboardEvent;
      if (code === config.codes[sequenceIndex.current]) {
        sequenceIndex.current++;
        if (sequenceIndex.current === config.codes.length) {
          shortcutAction(e as KeyboardEvent);
          sequenceIndex.current = 0;
        }
      } else {
        sequenceIndex.current = 0;
      }

      const modifiersMatch =
        (!config.ctrlKey || ctrlKey) &&
        (!config.altKey || altKey) &&
        (!config.shiftKey || shiftKey);

      if (!modifiersMatch) {
        sequenceIndex.current = 0;
      }
    },
    [shortcutAction, config],
  );

  useEffect(() => {
    targetElement.addEventListener("keydown", eventHandler);
    return () => targetElement.removeEventListener("keydown", eventHandler);
  }, [targetElement, eventHandler]);
};
