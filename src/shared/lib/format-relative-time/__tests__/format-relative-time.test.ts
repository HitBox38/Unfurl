import { describe, expect, it } from "vitest";

import { formatRelativeTime } from "@/shared/lib/format-relative-time";

const NOW = Date.UTC(2026, 8, 5, 12, 0, 0);
const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe("formatRelativeTime", () => {
  it("says just now for anything under a minute", () => {
    expect(formatRelativeTime(NOW - 30_000, NOW)).toBe("just now");
    expect(formatRelativeTime(NOW + 5_000, NOW)).toBe("just now");
  });

  it("counts minutes, hours and days", () => {
    expect(formatRelativeTime(NOW - 5 * MINUTE, NOW)).toBe("5m ago");
    expect(formatRelativeTime(NOW - 3 * HOUR, NOW)).toBe("3h ago");
    expect(formatRelativeTime(NOW - 2 * DAY, NOW)).toBe("2d ago");
  });

  it("falls back to a short date after a week", () => {
    const formatted = formatRelativeTime(NOW - 10 * DAY, NOW);

    expect(formatted).not.toMatch(/ago$/);
    expect(formatted.length).toBeGreaterThan(0);
  });
});
