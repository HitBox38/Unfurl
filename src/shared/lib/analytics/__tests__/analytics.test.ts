import { beforeEach, describe, expect, it, vi } from "vitest";

const sdk = vi.hoisted(() => ({
  init: vi.fn(),
  capture: vi.fn(),
  reset: vi.fn(),
  opt_in_capturing: vi.fn(),
  opt_out_capturing: vi.fn(),
}));
vi.mock("posthog-js", () => ({ default: sdk }));

const settle = async () => {
  await new Promise((resolve) => setTimeout(resolve, 0));
};

beforeEach(() => {
  vi.resetModules();
  vi.clearAllMocks();
  localStorage.clear();
  sdk.init.mockReturnValue(sdk);
  vi.stubEnv("PROD", true);
  vi.stubEnv("VITE_PUBLIC_POSTHOG_KEY", "phc_test");
  vi.stubEnv("VITE_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com");
  vi.stubEnv("VITE_PUBLIC_DISTRIBUTION", "web");
});

describe("optional analytics", () => {
  it("does not initialize, create an identifier, or queue events before consent", async () => {
    const analytics = await import("@/shared/lib/analytics");
    analytics.trackEvent("demo_loaded", { source: "button" });
    analytics.trackFirstGraphEdit();
    await settle();
    expect(sdk.init).not.toHaveBeenCalled();
    expect(localStorage.length).toBe(0);
    analytics.setAnalyticsConsent("granted");
    await settle();
    expect(sdk.capture.mock.calls.map(([event]) => event)).toEqual([
      "app_opened",
    ]);
  });

  it.each(["missing key", "development", "missing channel", "invalid host"])(
    "stays off for %s",
    async (reason) => {
      if (reason === "missing key") vi.stubEnv("VITE_PUBLIC_POSTHOG_KEY", "");
      if (reason === "development") vi.stubEnv("PROD", false);
      if (reason === "missing channel")
        vi.stubEnv("VITE_PUBLIC_DISTRIBUTION", "");
      if (reason === "invalid host")
        vi.stubEnv("VITE_PUBLIC_POSTHOG_HOST", "https://example.com");
      const analytics = await import("@/shared/lib/analytics");
      analytics.setAnalyticsConsent("granted");
      analytics.trackEvent("recent_file_opened", {});
      await settle();
      expect(sdk.init).not.toHaveBeenCalled();
    },
  );

  it("strips SDK URL defaults, story fields, arbitrary errors, and unapproved events", async () => {
    const analytics = await import("@/shared/lib/analytics");
    analytics.setAnalyticsConsent("granted");
    await settle();
    const config = sdk.init.mock.calls[0][1];
    expect(config).toMatchObject({
      autocapture: false,
      capture_pageview: false,
      capture_exceptions: false,
      disable_session_recording: true,
      disable_external_dependency_loading: true,
      persistence: "memory",
    });
    const clean = config.before_send({
      event: "import_failed",
      $set: { name: "Secret" },
      $set_once: { $initial_current_url: "file:///secret" },
      properties: {
        format: "json",
        error_class: "Secret story text",
        $current_url: "file:///secret",
        $referrer: "secret",
        title: "secret",
        raw_json: "secret",
        $set: { name: "secret" },
        $set_once: { $initial_current_url: "secret" },
      },
    });
    expect(clean.properties).toEqual({
      token: "phc_test",
      distinct_id: expect.any(String),
      surface: "web",
      distribution: "web",
      app_version: expect.any(String),
      $geoip_disable: true,
      $process_person_profile: true,
      format: "json",
    });
    expect(clean.$set).toBeUndefined();
    expect(clean.$set_once).toBeUndefined();
    expect(
      config.before_send({ event: "$pageview", properties: {} }),
    ).toBeNull();
    expect(
      config.before_send({ event: "constructor", properties: {} }),
    ).toBeNull();
  });

  it("counts the first real edit once across calls and reloads", async () => {
    let analytics = await import("@/shared/lib/analytics");
    analytics.setAnalyticsConsent("granted");
    analytics.trackFirstGraphEdit();
    analytics.trackFirstGraphEdit();
    await settle();
    analytics.trackFirstGraphEdit();
    await settle();
    vi.resetModules();
    analytics = await import("@/shared/lib/analytics");
    analytics.trackFirstGraphEdit();
    await settle();
    expect(
      sdk.capture.mock.calls.filter(([event]) => event === "first_graph_edit"),
    ).toHaveLength(1);
  });

  it("withdraws consent immediately and uses a new anonymous identity when enabled again", async () => {
    const analytics = await import("@/shared/lib/analytics");
    analytics.setAnalyticsConsent("granted");
    await settle();
    const id = localStorage.getItem("unfurl.analytics.id.v1");
    analytics.setAnalyticsConsent("denied");
    analytics.trackEvent("demo_loaded", { source: "button" });
    await settle();
    expect(sdk.opt_out_capturing).toHaveBeenCalledOnce();
    expect(localStorage.getItem("unfurl.analytics.id.v1")).toBeNull();
    expect(sdk.capture).toHaveBeenCalledTimes(1);
    expect(
      sdk.init.mock.calls[0][1].before_send({
        event: "demo_loaded",
        properties: { source: "button" },
      }),
    ).toBeNull();
    analytics.setAnalyticsConsent("granted");
    await settle();
    expect(localStorage.getItem("unfurl.analytics.id.v1")).not.toBe(id);
    expect(sdk.capture).toHaveBeenCalledTimes(2);
  });

  it("cancels events and SDK initialization when consent is withdrawn during lazy loading", async () => {
    const analytics = await import("@/shared/lib/analytics");
    analytics.setAnalyticsConsent("granted");
    analytics.trackEvent("demo_loaded", { source: "button" });
    analytics.setAnalyticsConsent("denied");
    await settle();
    expect(sdk.init).not.toHaveBeenCalled();
    expect(sdk.capture).not.toHaveBeenCalled();
  });

  it("does not break editing when storage is unavailable", async () => {
    const analytics = await import("@/shared/lib/analytics");
    const blocked = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    expect(analytics.setAnalyticsConsent("granted")).toBe(false);
    expect(() => analytics.trackFirstGraphEdit()).not.toThrow();
    await settle();
    expect(sdk.init).not.toHaveBeenCalled();
    blocked.mockRestore();
  });

  it("buckets node counts without exposing exact story sizes", async () => {
    const { nodeCountBucket } = await import("@/shared/lib/analytics");
    expect([0, 1, 20, 21, 100, 101].map(nodeCountBucket)).toEqual([
      "0",
      "1-20",
      "1-20",
      "21-100",
      "21-100",
      "100+",
    ]);
  });

  it("stops this session even when withdrawing consent cannot be persisted", async () => {
    const analytics = await import("@/shared/lib/analytics");
    analytics.setAnalyticsConsent("granted");
    await settle();
    const blocked = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("blocked");
      });
    expect(analytics.setAnalyticsConsent("denied")).toBe(false);
    expect(analytics.getAnalyticsConsent()).toBe("denied");
    analytics.trackEvent("recent_file_opened", {});
    expect(sdk.capture).toHaveBeenCalledTimes(1);
    blocked.mockRestore();
  });

  it("observes withdrawal in another tab and initializes only once", async () => {
    const analytics = await import("@/shared/lib/analytics");
    analytics.setAnalyticsConsent("granted");
    analytics.initAnalytics();
    analytics.initAnalytics();
    await settle();
    expect(sdk.init).toHaveBeenCalledOnce();
    expect(sdk.capture).toHaveBeenCalledTimes(1);
    localStorage.setItem("unfurl.analytics.consent.v1", "denied");
    window.dispatchEvent(
      new StorageEvent("storage", { key: "unfurl.analytics.consent.v1" }),
    );
    expect(sdk.opt_out_capturing).toHaveBeenCalledOnce();
    expect(localStorage.getItem("unfurl.analytics.id.v1")).toBeNull();
    analytics.trackEvent("recent_file_opened", {});
    expect(sdk.capture).toHaveBeenCalledTimes(1);
  });
});
