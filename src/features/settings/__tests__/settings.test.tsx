import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";

import { Settings, SettingsButton } from "@/features/settings";
import { Writing } from "@/features/settings/components/writing";
import { About } from "@/features/settings/components/about";
import { automaticUpdatesPreference } from "@/features/settings/hooks/use-settings-preferences";
import { useVersionCheck } from "@/features/version-check/hooks/use-version-check";
import { CHECK_INTERVAL_MS } from "@/features/version-check/constants";
import { SidebarProvider } from "@/shared/ui/sidebar";
import { TooltipProvider } from "@/shared/ui/tooltip";

declare const __APP_VERSION__: string;

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  vi.useRealTimers();
  Reflect.deleteProperty(window, "spellcheckPreferences");
});

const renderSettings = () =>
  render(
    <TooltipProvider>
      <SidebarProvider>
        <Settings desktop={false}>
          <SettingsButton />
        </Settings>
      </SidebarProvider>
    </TooltipProvider>,
  );

it("keeps one automatic lifecycle while closed and across repeated dialog opens", async () => {
  const fetch = vi
    .fn()
    .mockResolvedValue({ ok: true, json: async () => ({ version: "99.0.0" }) });
  vi.stubGlobal("fetch", fetch);
  vi.stubEnv("DEV", false);
  const user = userEvent.setup();
  renderSettings();
  const gear = await screen.findByRole("button", {
    name: "Settings — update available",
  });
  expect(fetch).toHaveBeenCalledTimes(1);
  await user.click(gear);
  await user.click(screen.getByRole("button", { name: "Updates" }));
  expect(screen.getByText("Unfurl v99.0.0 is available.")).toBeInTheDocument();
  await user.keyboard("{Escape}");
  await user.click(gear);
  expect(fetch).toHaveBeenCalledTimes(1);
  await user.click(
    screen.getByRole("checkbox", { name: "Automatically check for updates" }),
  );
  expect(automaticUpdatesPreference.read()).toBe(false);
  await user.click(screen.getByRole("button", { name: "Check for updates" }));
  expect(fetch).toHaveBeenCalledTimes(2);
});

it("disables every automatic trigger, retains manual checks, and handles re-enabling", async () => {
  vi.useFakeTimers();
  vi.stubEnv("DEV", false);
  const fetch = vi
    .fn()
    .mockResolvedValue({
      ok: true,
      json: async () => ({ version: __APP_VERSION__ }),
    });
  vi.stubGlobal("fetch", fetch);
  const hook = renderHook(
    ({ automatic }) => useVersionCheck(false, automatic),
    { initialProps: { automatic: false } },
  );
  await act(() => vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS));
  fireEvent.focus(window);
  fireEvent.online(window);
  fireEvent(document, new Event("visibilitychange"));
  expect(fetch).not.toHaveBeenCalled();
  await act(() => hook.result.current.check(true));
  expect(fetch).toHaveBeenCalledTimes(1);
  hook.rerender({ automatic: true });
  await act(() => vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS));
  expect(fetch).toHaveBeenCalledTimes(2);
  hook.rerender({ automatic: false });
  await act(() => vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS));
  fireEvent.focus(window);
  fireEvent.online(window);
  expect(fetch).toHaveBeenCalledTimes(2);
});

it("shows a failed preference save and excludes Writing on web", async () => {
  const user = userEvent.setup();
  renderSettings();
  await user.click(screen.getByRole("button", { name: "Settings" }));
  expect(
    screen.queryByRole("button", { name: "Writing" }),
  ).not.toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Updates" }));
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
    throw new Error("blocked");
  });
  await user.click(
    screen.getByRole("checkbox", { name: "Automatically check for updates" }),
  );
  expect(screen.getByRole("alert")).toHaveTextContent("Could not save");
  expect(screen.getByRole("checkbox")).toBeChecked();
});

it.each([
  ["web", "Web"],
  ["desktop_github", "Desktop · GitHub"],
  ["desktop_itch", "Desktop · itch.io"],
  ["", "Development / unspecified distribution"],
])("renders About for %s independently of analytics", (distribution, label) => {
  vi.stubEnv("VITE_PUBLIC_DISTRIBUTION", distribution);
  render(<About />);
  expect(screen.getByText(label)).toBeInTheDocument();
  expect(screen.getByText(__APP_VERSION__)).toBeInTheDocument();
  expect(screen.getAllByRole("link")).toHaveLength(4);
  expect(screen.getByRole("link", { name: "Online app" })).toHaveAttribute(
    "href",
    "https://unfurl-online.vercel.app",
  );
});

it("applies Writing changes through IPC and shows main-process save errors", async () => {
  const state = {
    enabled: true,
    languages: ["en-US"],
    availableLanguages: ["en-US", "fr"],
    languagesManagedByOS: false,
  };
  const set = vi
    .fn()
    .mockResolvedValue({
      ...state,
      error: "Could not save spelling preferences.",
    });
  Object.defineProperty(window, "spellcheckPreferences", {
    configurable: true,
    value: { get: vi.fn().mockResolvedValue(state), set },
  });
  const user = userEvent.setup();
  render(<Writing />);
  await user.click(
    await screen.findByRole("checkbox", { name: "Check spelling as I type" }),
  );
  expect(set).toHaveBeenCalledWith(expect.objectContaining({ enabled: false }));
  expect(await screen.findByRole("alert")).toHaveTextContent("Could not save");
  expect(
    screen.getByRole("checkbox", { name: "Check spelling as I type" }),
  ).toBeChecked();
});

it("shows OS-managed languages on macOS and recovers a lost IPC response", async () => {
  const initial = {
    enabled: true,
    languages: ["en-US"],
    availableLanguages: [],
    languagesManagedByOS: true,
  };
  const get = vi
    .fn()
    .mockResolvedValueOnce(initial)
    .mockResolvedValue({ ...initial, enabled: false });
  Object.defineProperty(window, "spellcheckPreferences", {
    configurable: true,
    value: { get, set: vi.fn().mockRejectedValue(new Error("connection")) },
  });
  const user = userEvent.setup();
  render(<Writing />);
  expect(await screen.findByText(/On macOS/)).toBeInTheDocument();
  expect(
    screen.queryByRole("group", { name: "Spelling languages" }),
  ).not.toBeInTheDocument();
  await user.click(
    screen.getByRole("checkbox", { name: "Check spelling as I type" }),
  );
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Current settings are shown",
  );
  expect(screen.getByRole("checkbox")).not.toBeChecked();
});
