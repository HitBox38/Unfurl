import { describe, expect, it } from "vitest";

import { createRuntimeHistory } from "@/app/router-history";

const createTestWindow = (
  protocol: "file:" | "http:",
  pathname: string,
): Window => {
  const testWindow = {
    location: {
      protocol,
      pathname,
      search: "",
      hash: "",
    },
    history: {
      length: 1,
      state: undefined as unknown,
      pushState(state: unknown) {
        this.state = state;
      },
      replaceState(state: unknown) {
        this.state = state;
      },
      back() {},
      forward() {},
      go() {},
    },
    addEventListener() {},
    removeEventListener() {},
  };

  return testWindow as unknown as Window;
};

describe("createRuntimeHistory", () => {
  it("treats packaged file URLs as the app root route", () => {
    const history = createRuntimeHistory(
      createTestWindow(
        "file:",
        "/C:/Program%20Files/Unfurl/resources/app/dist/index.html",
      ),
    );

    expect(history.location.pathname).toBe("/");
    expect(history.createHref("/files/example")).toBe(
      "/C:/Program%20Files/Unfurl/resources/app/dist/index.html#/files/example",
    );
  });
});
