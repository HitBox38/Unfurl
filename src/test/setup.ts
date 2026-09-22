import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

// jsdom 30 emits a window blur during Radix Select's portal focus handoff,
// which closes the listbox before user-event can choose an option.
if (typeof window !== "undefined") {
  window.addEventListener(
    "blur",
    (event) => {
      if (document.querySelector('[role="listbox"]')) {
        event.stopImmediatePropagation();
      }
    },
    true,
  );
}

afterEach(() => {
  cleanup();
  localStorage.clear();
});

if (typeof window !== "undefined" && !window.PointerEvent) {
  class PointerEventStub extends MouseEvent {
    pointerId: number;
    width: number;
    height: number;
    pressure: number;
    tangentialPressure: number;
    tiltX: number;
    tiltY: number;
    twist: number;
    pointerType: string;
    isPrimary: boolean;

    constructor(type: string, eventInitDict: PointerEventInit = {}) {
      super(type, eventInitDict);
      this.pointerId = eventInitDict.pointerId ?? 1;
      this.width = eventInitDict.width ?? 1;
      this.height = eventInitDict.height ?? 1;
      this.pressure = eventInitDict.pressure ?? 0;
      this.tangentialPressure = eventInitDict.tangentialPressure ?? 0;
      this.tiltX = eventInitDict.tiltX ?? 0;
      this.tiltY = eventInitDict.tiltY ?? 0;
      this.twist = eventInitDict.twist ?? 0;
      this.pointerType = eventInitDict.pointerType ?? "mouse";
      this.isPrimary = eventInitDict.isPrimary ?? true;
    }
  }

  window.PointerEvent = PointerEventStub as unknown as typeof PointerEvent;
  globalThis.PointerEvent =
    PointerEventStub as unknown as typeof PointerEvent;
}

// jsdom missing pieces that Radix UI primitives expect; patch once globally
// so component tests can exercise the @radix-ui/* primitives without crashing.
if (typeof Element !== "undefined") {
  if (!Element.prototype.hasPointerCapture) {
    Element.prototype.hasPointerCapture = () => false;
  }
  if (!Element.prototype.releasePointerCapture) {
    Element.prototype.releasePointerCapture = () => {};
  }
  if (!Element.prototype.setPointerCapture) {
    Element.prototype.setPointerCapture = () => {};
  }
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = () => {};
  }
}

if (typeof window !== "undefined" && !window.ResizeObserver) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}

if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}
