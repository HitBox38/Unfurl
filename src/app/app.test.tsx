import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "@/app/app";
import { useDialogStore } from "@/shared/stores";

vi.mock("@tanstack/react-router", () => ({
  Outlet: () => <div data-testid="route-outlet" />,
  Link: ({
    children,
    to,
    ...props
  }: {
    children: ReactNode;
    to: string;
  }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/features/recent-files-sidebar", () => ({
  RecentFilesSidebar: () => <nav aria-label="Editable files" />,
}));

describe("App shell", () => {
  afterEach(() => {
    Reflect.deleteProperty(window, "ipcRenderer");
    useDialogStore.getState().reset();
  });

  it("renders a web app bar with the sidebar toggle and home link", () => {
    render(<App />);

    const bar = screen.getByRole("banner");
    expect(bar).toHaveTextContent("Unfurl");
    expect(bar).not.toHaveClass("electron-titlebar-drag-region");
    expect(screen.getByTestId("app-shell")).toHaveClass("app-shell");
    expect(
      screen.getByRole("button", { name: /toggle sidebar/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /go to home page/i }),
    ).toHaveAttribute("href", "/");
    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(
      screen.getByRole("navigation", { name: /editable files/i }),
    ).toBeInTheDocument();
  });

  it("renders Electron navigation chrome in the Electron app view", () => {
    Object.defineProperty(window, "ipcRenderer", {
      configurable: true,
      value: { on: vi.fn(), removeListener: vi.fn(), send: vi.fn() },
    });

    render(<App />);

    const bar = screen.getByRole("banner");
    expect(bar).toHaveTextContent("Unfurl");
    expect(bar).toHaveClass("electron-titlebar-drag-region");
    expect(bar).not.toHaveClass("draggable");
    expect(
      screen.getByRole("button", { name: /toggle sidebar/i }),
    ).toHaveClass("electron-titlebar-no-drag");
    expect(screen.getByRole("link", { name: /go to home page/i })).toHaveClass(
      "electron-titlebar-no-drag",
    );
    expect(screen.getByTestId("app-shell")).toHaveClass(
      "app-shell",
      "electron-app-shell",
      "h-svh",
      "overflow-hidden",
    );
    expect(screen.getByTestId("app-sidebar-layout")).toHaveClass(
      "electron-sidebar-layout",
      "min-h-0",
    );
  });

  it("toggles the sidebar from the app bar", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /toggle sidebar/i }));
    await user.click(screen.getByRole("button", { name: /toggle sidebar/i }));

    expect(
      screen.getByRole("button", { name: /toggle sidebar/i }),
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

  it("does not open an edit menu from a normal renderer right click", () => {
    render(<App />);

    fireEvent.contextMenu(screen.getByTestId("app-shell"));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
