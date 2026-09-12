import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SpellcheckContextMenu } from "@/features/spellcheck-context-menu";
import {
  SPELLCHECK_ADD_WORD_CHANNEL,
  SPELLCHECK_CONTEXT_MENU_CHANNEL,
  SPELLCHECK_REPLACE_MISSPELLING_CHANNEL,
  type SpellcheckContextMenuPayload,
} from "@/shared/types";

const createIpcRendererMock = () => {
  const listeners = new Map<string, (...args: unknown[]) => void>();
  const ipcRenderer = {
    on: vi.fn((channel: string, listener: (...args: unknown[]) => void) => {
      listeners.set(channel, listener);
      return ipcRenderer;
    }),
    removeListener: vi.fn(
      (channel: string, listener: (...args: unknown[]) => void) => {
        if (listeners.get(channel) === listener) {
          listeners.delete(channel);
        }
        return ipcRenderer;
      },
    ),
    send: vi.fn(),
  };

  Object.defineProperty(window, "ipcRenderer", {
    configurable: true,
    value: ipcRenderer,
  });

  return {
    emitSpellcheckMenu(payload: SpellcheckContextMenuPayload) {
      const listener = listeners.get(SPELLCHECK_CONTEXT_MENU_CHANNEL);

      if (!listener) {
        throw new Error("Spellcheck context menu listener was not registered");
      }

      act(() => listener({}, payload));
    },
    ipcRenderer,
  };
};

describe("SpellcheckContextMenu", () => {
  afterEach(() => {
    Reflect.deleteProperty(window, "ipcRenderer");
  });

  it("opens with Electron spellcheck suggestions and replaces misspellings", async () => {
    const { emitSpellcheckMenu, ipcRenderer } = createIpcRendererMock();
    render(<SpellcheckContextMenu />);

    emitSpellcheckMenu({
      dictionarySuggestions: ["dialogue", "dialog"],
      misspelledWord: "dialouge",
      x: 24,
      y: 32,
    });

    expect(await screen.findByRole("menu")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: "dialogue" }));

    expect(ipcRenderer.send).toHaveBeenCalledWith(
      SPELLCHECK_REPLACE_MISSPELLING_CHANNEL,
      "dialogue",
    );
  });

  it("allows the misspelled word to be added to the dictionary", async () => {
    const { emitSpellcheckMenu, ipcRenderer } = createIpcRendererMock();
    render(<SpellcheckContextMenu />);

    emitSpellcheckMenu({
      dictionarySuggestions: [],
      misspelledWord: "Unfurlian",
      x: 24,
      y: 32,
    });

    fireEvent.click(await screen.findByRole("menuitem", { name: "Add to dictionary" }));

    expect(ipcRenderer.send).toHaveBeenCalledWith(
      SPELLCHECK_ADD_WORD_CHANNEL,
      "Unfurlian",
    );
  });

  it("does not open when Electron has no spellcheck actions", () => {
    const { emitSpellcheckMenu } = createIpcRendererMock();
    render(<SpellcheckContextMenu />);

    emitSpellcheckMenu({
      dictionarySuggestions: [],
      x: 24,
      y: 32,
    });

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
