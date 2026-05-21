import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "node:path";

import { createMainWindowOptions } from "./main-window-options";
import { resolveMainProcessPaths } from "./main-paths";
import {
  SPELLCHECK_ADD_WORD_CHANNEL,
  SPELLCHECK_CONTEXT_MENU_CHANNEL,
  SPELLCHECK_REPLACE_MISSPELLING_CHANNEL,
  type SpellcheckContextMenuPayload,
} from "@/shared/types";

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
const mainProcessPaths = resolveMainProcessPaths(import.meta.url, app.isPackaged);

process.env.DIST = mainProcessPaths.dist;
process.env.VITE_PUBLIC = mainProcessPaths.vitePublic;

let win: BrowserWindow | null;
// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
const VITE_DEV_SERVER_URL = process.env["VITE_DEV_SERVER_URL"];

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

ipcMain.on(SPELLCHECK_REPLACE_MISSPELLING_CHANNEL, (_event, suggestion) => {
  if (isNonEmptyString(suggestion)) {
    win?.webContents.replaceMisspelling(suggestion);
  }
});

ipcMain.on(SPELLCHECK_ADD_WORD_CHANNEL, (_event, word) => {
  if (isNonEmptyString(word)) {
    win?.webContents.session.addWordToSpellCheckerDictionary(word);
  }
});

function createWindow() {
  console.log(process.env.VITE_PUBLIC);

  win = new BrowserWindow(
    createMainWindowOptions({
      preload: mainProcessPaths.preload,
      vitePublic: mainProcessPaths.vitePublic,
    })
  );

  // Test active push message to Renderer-process.
  win.webContents.on("did-finish-load", () => {
    win?.webContents.send("main-process-message", new Date().toLocaleString());
  });

  win.webContents.on("context-menu", (_event, params) => {
    const payload: SpellcheckContextMenuPayload = {
      dictionarySuggestions: [...params.dictionarySuggestions],
      misspelledWord: params.misspelledWord || undefined,
      x: params.x,
      y: params.y,
    };

    if (
      payload.dictionarySuggestions.length > 0 ||
      payload.misspelledWord
    ) {
      win?.webContents.send(SPELLCHECK_CONTEXT_MENU_CHANNEL, payload);
    }
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (url !== win?.webContents.getURL()) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL);
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(process.env.DIST, "index.html"));
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
    win = null;
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.whenReady().then(createWindow);
