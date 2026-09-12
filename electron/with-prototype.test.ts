import { describe, expect, it } from "vitest";

import { withPrototype } from "./with-prototype";

class EventEmitterLike {
  calls: string[] = [];

  on(channel: string) {
    this.calls.push(channel);
    return this;
  }
}

class IpcRendererLike extends EventEmitterLike {
  send(channel: string) {
    this.calls.push(channel);
  }
}

describe("withPrototype", () => {
  it("copies inherited non-enumerable prototype methods onto the exposed object", () => {
    const renderer = new IpcRendererLike();
    const exposed = withPrototype(renderer);

    expect(Object.prototype.hasOwnProperty.call(exposed, "on")).toBe(true);
    expect(Object.prototype.hasOwnProperty.call(exposed, "send")).toBe(true);
    expect(Object.keys(exposed)).toEqual(expect.arrayContaining(["on", "send"]));
    expect(exposed.on("main-process-message")).toBe(renderer);
    exposed.send("renderer-ready");
    expect(renderer.calls).toEqual(["main-process-message", "renderer-ready"]);
  });
});
