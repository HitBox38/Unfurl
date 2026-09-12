import { describe, expect, it } from "vitest";

import { cn } from "@/shared/lib/cn";

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("foo", "bar")).toBe("foo bar");
  });

  it("filters falsy values", () => {
    expect(cn("foo", false, null, undefined, "bar")).toBe("foo bar");
  });

  it("merges conflicting Tailwind utility classes (last wins)", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("handles object and array inputs from clsx", () => {
    expect(cn(["foo", { bar: true, baz: false }, ["qux"]])).toBe("foo bar qux");
  });
});
