import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "@/app/app";
import { useDialogStore } from "@/shared/stores";

vi.mock("@tanstack/react-router", () => ({
  Outlet: () => <div data-testid="route-outlet" />,
}));

vi.mock("@/features/recent-files", () => ({
  RecentFilesSidebar: () => <nav aria-label="Editable files" />,
}));

describe("App shell", () => {
  afterEach(() => {
    Reflect.deleteProperty(window, "ipcRenderer");
    useDialogStore.getState().reset();
  });

  it("does not render the Electron titlebar in the web view", () => {
    render(<App />);

    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /toggle editable files sidebar/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(
      screen.getByRole("navigation", { name: /editable files/i }),
    ).toBeInTheDocument();
  });

  it("renders Electron navigation chrome in the Electron app view", () => {
    Object.defineProperty(window, "ipcRenderer", {
      configurable: true,
      value: { on: vi.fn() },
    });

    render(<App />);

    expect(screen.getByRole("banner")).toHaveTextContent("Unfurl");
    expect(screen.getByTestId("app-shell")).toHaveClass(
      "electron-app-shell",
      "h-svh",
      "overflow-hidden",
    );
    expect(screen.getByTestId("app-sidebar-layout")).toHaveClass(
      "electron-sidebar-layout",
      "min-h-0",
    );
    expect(screen.getByRole("banner")).toHaveClass(
      "electron-titlebar-drag-region",
    );
    expect(screen.getByRole("banner")).not.toHaveClass("draggable");
    expect(
      screen.getByRole("navigation", { name: /editable files/i }),
    ).toBeInTheDocument();
  });

  it("opens the FAQ with the TanStack hotkey sequence", () => {
    render(<App />);

    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          code: "KeyC",
          ctrlKey: true,
          key: "C",
          bubbles: true,
        }),
      );
      document.dispatchEvent(
        new KeyboardEvent("keydown", {
          code: "KeyF",
          ctrlKey: true,
          key: "F",
          bubbles: true,
        }),
      );
    });

    expect(screen.getByRole("dialog", { name: "FAQ" })).toBeInTheDocument();
  });
});
