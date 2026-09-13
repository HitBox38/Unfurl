import { StrictMode } from "react";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { VersionCheck } from "@/features/version-check";
import { fetchLatestVersion } from "@/features/version-check/api";
import {
  CHECK_INTERVAL_MS,
  CHECK_TIMEOUT_MS,
  LATEST_RELEASE_API,
} from "@/features/version-check/constants";
import { isNewerVersion } from "@/features/version-check/helpers";
import { useVersionCheck } from "@/features/version-check/hooks/use-version-check";
import { SidebarProvider } from "@/shared/ui/sidebar";
import { TooltipProvider } from "@/shared/ui/tooltip";

declare const __APP_VERSION__: string;

const mockResponse = (data: unknown, status = 200) =>
  vi
    .fn()
    .mockResolvedValue({ ok: status === 200, status, json: async () => data });
const stableRelease = (version = "v99.0.0") => ({
  tag_name: version,
  draft: false,
  prerelease: false,
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
  Reflect.deleteProperty(window, "ipcRenderer");
});

describe("version comparison", () => {
  it.each([
    ["v2.10.0", "2.9.9", true],
    ["3.0.0", "2.99.99", true],
    ["2.1.0", "2.1.0", false],
    ["2.0.9", "2.1.0", false],
    ["2.1.0+new", "2.1.0+old", false],
    ["2.1.0", "2.1.0-rc.1", true],
    ["2.1.0-rc.1", "2.1.0", false],
    ["2.1.0-beta.10", "2.1.0-beta.9", true],
    ["2.1.0-beta", "2.1.0-alpha", true],
    ["2.1.0-alpha.1", "2.1.0-alpha", true],
    ["2.1.0-alpha", "2.1.0-alpha.1", false],
    ["2.1.0-alpha", "2.1.0-1", true],
  ])("compares %s to %s", (candidate, current, expected) => {
    expect(isNewerVersion(candidate, current)).toBe(expected);
  });

  it.each(["latest", "2.1", "02.1.0", "2.1.0-01", "2.1.0-", "2.1.0/evil"])(
    "rejects invalid version %s",
    (version) => {
      expect(() => isNewerVersion(version, "2.1.0")).toThrow();
    },
  );
});

describe("version sources", () => {
  it("uses GitHub stable releases for desktop and constructs a trusted link", async () => {
    const fetch = mockResponse({
      ...stableRelease(),
      html_url: "https://example.com/unsafe",
    });
    vi.stubGlobal("fetch", fetch);
    const signal = new AbortController().signal;
    expect(await fetchLatestVersion(true, signal)).toEqual({
      version: "99.0.0",
      updateAvailable: true,
      releaseUrl: "https://github.com/HitBox38/Unfurl/releases/tag/v99.0.0",
    });
    expect(fetch).toHaveBeenCalledWith(
      LATEST_RELEASE_API,
      expect.objectContaining({ signal, credentials: "omit" }),
    );
  });

  it("checks the deployed web manifest without using the browser cache", async () => {
    const fetch = mockResponse({ version: "99.0.0" });
    vi.stubGlobal("fetch", fetch);
    expect(
      await fetchLatestVersion(false, new AbortController().signal),
    ).toMatchObject({ updateAvailable: true });
    expect(fetch).toHaveBeenCalledWith(
      expect.stringMatching(/^\/version\.json\?t=\d+$/),
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("handles no published release", async () => {
    vi.stubGlobal("fetch", mockResponse({}, 404));
    expect(
      await fetchLatestVersion(true, new AbortController().signal),
    ).toBeNull();
    await expect(
      fetchLatestVersion(false, new AbortController().signal),
    ).rejects.toThrow();
  });

  it.each([
    {},
    null,
    { ...stableRelease(), prerelease: true },
    { ...stableRelease(), draft: true },
    stableRelease("invalid"),
  ])("rejects malformed or unpublished desktop data: %j", async (data) => {
    vi.stubGlobal("fetch", mockResponse(data));
    await expect(
      fetchLatestVersion(true, new AbortController().signal),
    ).rejects.toThrow();
  });

  it.each([403, 429, 500])(
    "treats HTTP %s as a failed check",
    async (status) => {
      vi.stubGlobal("fetch", mockResponse({}, status));
      await expect(
        fetchLatestVersion(true, new AbortController().signal),
      ).rejects.toThrow();
    },
  );
});

describe("automatic checks", () => {
  it("checks once in StrictMode, throttles focus, polls, and cleans up", async () => {
    vi.useFakeTimers();
    vi.stubEnv("DEV", false);
    const fetch = mockResponse({ version: __APP_VERSION__ });
    vi.stubGlobal("fetch", fetch);
    const { result, unmount } = renderHook(() => useVersionCheck(false), {
      wrapper: StrictMode,
    });
    await act(() => vi.advanceTimersByTimeAsync(1));
    expect(result.current.status).toBe("checked");
    expect(fetch).toHaveBeenCalledTimes(1);
    fireEvent.focus(window);
    expect(fetch).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS));
    expect(fetch).toHaveBeenCalledTimes(2);
    unmount();
    await act(() => vi.advanceTimersByTimeAsync(CHECK_INTERVAL_MS));
    fireEvent.focus(window);
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("aborts a stalled check and allows retry without overlapping requests", async () => {
    vi.useFakeTimers();
    const fetch = vi.fn(
      (_url: string, { signal }: RequestInit) =>
        new Promise((_resolve, reject) => {
          signal?.addEventListener("abort", () => reject(new Error("aborted")));
        }),
    );
    vi.stubGlobal("fetch", fetch);
    const { result, unmount } = renderHook(() => useVersionCheck(false));
    act(() => {
      void result.current.check(true);
      void result.current.check(true);
    });
    expect(fetch).toHaveBeenCalledTimes(1);
    await act(() => vi.advanceTimersByTimeAsync(CHECK_TIMEOUT_MS));
    expect(result.current.status).toBe("error");
    act(() => {
      void result.current.check(true);
    });
    expect(fetch).toHaveBeenCalledTimes(2);
    const signal = fetch.mock.calls[1][1].signal;
    unmount();
    expect(signal?.aborted).toBe(true);
  });
});

async function openUpdates(desktop = false) {
  if (desktop)
    Object.defineProperty(window, "ipcRenderer", {
      configurable: true,
      value: {},
    });
  render(
    <TooltipProvider>
      <SidebarProvider>
        <VersionCheckHost desktop={desktop} />
      </SidebarProvider>
    </TooltipProvider>,
  );
  await userEvent.click(
    screen.getByRole("button", { name: "Check for updates" }),
  );
}

function VersionCheckHost({ desktop }: { desktop: boolean }) {
  const versionCheck = useVersionCheck(desktop);
  return <VersionCheck {...versionCheck} />;
}

describe("update section", () => {
  it("offers desktop downloads when a new release is available", async () => {
    vi.stubGlobal("fetch", mockResponse(stableRelease()));
    await openUpdates(true);
    expect(
      await screen.findByText("Unfurl v99.0.0 is available."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Download update" }),
    ).toHaveAttribute(
      "href",
      "https://github.com/HitBox38/Unfurl/releases/tag/v99.0.0",
    );
    expect(
      screen.queryByRole("button", { name: "Reload to update" }),
    ).not.toBeInTheDocument();
  });

  it("offers an explicit web reload with a save reminder", async () => {
    vi.stubGlobal("fetch", mockResponse({ version: "99.0.0" }));
    await openUpdates();
    expect(
      await screen.findByRole("button", { name: "Reload to update" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Save any open edits/)).toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Download update" }),
    ).not.toBeInTheDocument();
  });

  it("reports up to date and lets a failed check be retried", async () => {
    const fetch = mockResponse({
      version: __APP_VERSION__,
    }).mockRejectedValueOnce(new Error("offline"));
    vi.stubGlobal("fetch", fetch);
    await openUpdates();
    expect(
      await screen.findByText(/Couldn’t check for updates/),
    ).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole("button", { name: "Check for updates" }),
    );
    expect(await screen.findByText("You’re up to date.")).toBeInTheDocument();
  });
});
