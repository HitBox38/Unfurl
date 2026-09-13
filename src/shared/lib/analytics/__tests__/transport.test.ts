import { afterEach, expect, it, vi } from "vitest";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("sends only the allowed envelope through the real SDK and stops after withdrawal", async () => {
  vi.stubEnv("PROD", true);
  vi.stubEnv("VITE_PUBLIC_POSTHOG_KEY", "phc_test_only");
  vi.stubEnv("VITE_PUBLIC_POSTHOG_HOST", "https://eu.i.posthog.com");
  vi.stubEnv("VITE_PUBLIC_DISTRIBUTION", "web");
  const requests: { url: string; body: unknown }[] = [];
  const fetch = vi.fn(async (url: string, init?: RequestInit) => {
    requests.push({ url, body: init?.body });
    return new Response("{}", { status: 200 });
  });
  vi.stubGlobal("fetch", fetch);
  const analytics = await import("@/shared/lib/analytics");
  analytics.trackEvent("recent_file_opened", {});
  expect(fetch).not.toHaveBeenCalled();
  analytics.setAnalyticsConsent("granted");
  await vi.waitFor(() => expect(fetch).toHaveBeenCalled(), { timeout: 5000 });
  const request = requests.find((request) => request.url.includes("/e/"));
  expect(request).toBeDefined();
  const bytes = request!.body;
  const decoded =
    typeof bytes === "string"
      ? JSON.parse(bytes)
      : await new Response(
          new Response(bytes as BodyInit).body!.pipeThrough(
            new DecompressionStream("gzip"),
          ),
        ).json();
  expect(Object.keys(decoded).sort()).toEqual(["api_key", "batch", "sent_at"]);
  expect(decoded.batch).toHaveLength(1);
  const payload = decoded.batch[0];
  expect(payload.event).toBe("app_opened");
  expect(payload.properties).toMatchObject({
    distribution: "web",
    $set: { distribution: "web" },
    $geoip_disable: true,
  });
  expect(payload.properties.$session_id).toEqual(expect.any(String));
  expect(Object.keys(payload).sort()).toEqual([
    "event",
    "properties",
    "timestamp",
    "uuid",
  ]);
  expect(Object.keys(payload.properties).sort()).toEqual(
    [
      "$geoip_disable",
      "$process_person_profile",
      "$session_id",
      "$set",
      "app_version",
      "distinct_id",
      "distribution",
      "surface",
      "token",
    ].sort(),
  );
  expect(requests.every((request) => request.url.includes("/e/"))).toBe(true);
  analytics.setAnalyticsConsent("denied");
  const count = fetch.mock.calls.length;
  analytics.trackEvent("recent_file_opened", {});
  await new Promise((resolve) => setTimeout(resolve, 20));
  expect(fetch).toHaveBeenCalledTimes(count);
});
