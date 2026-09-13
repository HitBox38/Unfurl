import { act, fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "@/app/app";
import { useDialogStore } from "@/shared/stores";

vi.mock("@tanstack/react-router", () => ({
  Outlet: () => <div data-testid="route-outlet" />,
  Link: ({ children, to, ...props }: { children: ReactNode; to: string }) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));

describe("App shell", () => {
  afterEach(() => {
    Reflect.deleteProperty(window, "ipcRenderer");
    useDialogStore.getState().reset();
  });

  it("puts web navigation in the sidebar and limits the top bar to mobile", () => {
    render(<App />);

    const bar = screen.getByRole("banner");
    expect(bar).toHaveTextContent("Unfurl");
    expect(bar).not.toHaveClass("electron-titlebar-drag-region");
    expect(bar).toHaveClass("md:hidden");
    const sidebar = screen.getByLabelText("Editable files sidebar");
    expect(screen.getByTestId("app-shell")).toHaveClass("app-shell");
    expect(
      within(sidebar).getByRole("button", { name: /toggle sidebar/i }),
    ).toBeInTheDocument();
    expect(
      within(sidebar).getByRole("link", { name: /go to home page/i }),
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
    expect(screen.getByRole("button", { name: /toggle sidebar/i })).toHaveClass(
      "electron-titlebar-no-drag",
    );
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

  it("collapses and reopens the web sidebar using its own navigation", async () => {
    const user = userEvent.setup();
    render(<App />);

    const sidebar = screen.getByLabelText("Editable files sidebar");
    const toggle = within(sidebar).getByRole("button", { name: /toggle sidebar/i });
    const sidebarState = sidebar.closest('[data-slot="sidebar"]');
    expect(sidebarState).toHaveAttribute("data-state", "expanded");
    await user.click(toggle);
    expect(sidebarState).toHaveAttribute("data-state", "collapsed");
    expect(within(sidebar).getByRole("link", { name: /go to home page/i })).toHaveAttribute("href", "/");
    await user.click(toggle);
    expect(sidebarState).toHaveAttribute("data-state", "expanded");
  });

  it("opens help with F1 and leaves copy/find alone", () => {
    render(<App />);
    fireEvent.keyDown(document, { key: "c", code: "KeyC", ctrlKey: true });
    fireEvent.keyDown(document, { key: "f", code: "KeyF", ctrlKey: true });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    act(() => {
      document.dispatchEvent(
        new KeyboardEvent("keydown", { key: "F1", code: "F1", bubbles: true }),
      );
    });
    expect(screen.getByRole("dialog", { name: "FAQ" })).toBeInTheDocument();
  });

  it("opens mobile navigation and closes the drawer when going home", async () => {
    const originalWidth = window.innerWidth;
    window.innerWidth = 390;
    try {
      const user = userEvent.setup();
      render(<App />);
      await user.click(screen.getByRole("button", { name: /toggle sidebar/i }));
      const drawer = screen.getByRole("dialog", { name: "Sidebar" });
      await user.click(within(drawer).getByRole("link", { name: /go to home page/i }));
      expect(screen.queryByRole("dialog", { name: "Sidebar" })).not.toBeInTheDocument();
    } finally {
      window.innerWidth = originalWidth;
    }
  });

  it("does not open an edit menu from a normal renderer right click", () => {
    render(<App />);

    fireEvent.contextMenu(screen.getByTestId("app-shell"));

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
