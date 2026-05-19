import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "@/app/app";

vi.mock("@tanstack/react-router", () => ({
  Outlet: () => <main data-testid="route-outlet" />,
}));

vi.mock("@/features/recent-files", () => ({
  RecentFilesSidebar: () => <nav aria-label="Editable files" />,
}));

describe("App shell", () => {
  afterEach(() => {
    Reflect.deleteProperty(window, "ipcRenderer");
  });

  it("does not render Electron navigation chrome in the web view", () => {
    render(<App />);

    expect(screen.queryByRole("banner")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: /editable files/i }),
    ).not.toBeInTheDocument();
  });

  it("renders Electron navigation chrome in the Electron app view", () => {
    Object.defineProperty(window, "ipcRenderer", {
      configurable: true,
      value: { on: vi.fn() },
    });

    render(<App />);

    expect(screen.getByRole("banner")).toHaveTextContent("Unfurl");
    expect(screen.getByRole("banner")).toHaveClass(
      "electron-titlebar-drag-region",
    );
    expect(screen.getByRole("banner")).not.toHaveClass("draggable");
    expect(
      screen.getByRole("navigation", { name: /editable files/i }),
    ).toBeInTheDocument();
  });
});
