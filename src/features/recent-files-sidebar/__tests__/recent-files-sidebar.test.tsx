import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";

import { RecentFilesSidebar } from "@/features/recent-files-sidebar";
import { SidebarProvider } from "@/shared/ui/sidebar";

vi.mock("@tanstack/react-router", () => ({
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

describe("RecentFilesSidebar", () => {
  it("links the Unfurl title to the home page", () => {
    render(
      <SidebarProvider>
        <RecentFilesSidebar />
      </SidebarProvider>,
    );

    expect(
      screen.getByRole("link", { name: /go to home page/i }),
    ).toHaveAttribute("href", "/");
  });
});
