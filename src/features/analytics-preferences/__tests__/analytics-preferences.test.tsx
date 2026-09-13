import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";

import { AnalyticsPreferences } from "@/features/analytics-preferences";
import { getAnalyticsConsent } from "@/shared/lib/analytics";
import { SidebarProvider } from "@/shared/ui/sidebar";
import { TooltipProvider } from "@/shared/ui/tooltip";

const sdk = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  reset: vi.fn(),
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
}));
vi.mock("posthog-js", () => ({ default: sdk }));

beforeEach(() => {
  vi.stubEnv("PROD", true);
  vi.stubEnv("VITE_PUBLIC_POSTHOG_KEY", "phc_test");
  vi.stubEnv("VITE_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com");
  vi.stubEnv("VITE_PUBLIC_DISTRIBUTION", "web");
  sdk.init.mockReturnValue(sdk);
});

it("keeps analytics off until enabled and lets the user withdraw consent", async () => {
  const user = userEvent.setup();
  render(
    <TooltipProvider>
      <SidebarProvider>
        <AnalyticsPreferences />
      </SidebarProvider>
    </TooltipProvider>,
  );
  await user.click(screen.getByRole("button", { name: "Privacy & analytics" }));
  expect(screen.getByRole("status")).toHaveTextContent("Analytics are off");
  expect(getAnalyticsConsent()).toBe("pending");
  await user.click(
    screen.getByRole("button", { name: "Enable anonymous analytics" }),
  );
  expect(getAnalyticsConsent()).toBe("granted");
  await user.click(screen.getByRole("button", { name: "Privacy & analytics" }));
  expect(screen.getByRole("status")).toHaveTextContent("Analytics are on");
  await user.click(screen.getByRole("button", { name: "Turn analytics off" }));
  expect(getAnalyticsConsent()).toBe("denied");
});
