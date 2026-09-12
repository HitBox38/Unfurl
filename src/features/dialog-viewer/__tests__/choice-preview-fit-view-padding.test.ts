import { afterEach, describe, expect, it } from "vitest";

import {
  CHOICE_PREVIEW_FIT_VIEW_PADDING,
  NODE_EDITOR_WIDTH_REM,
} from "@/features/dialog-viewer/constants";
import { getChoicePreviewFitViewPadding } from "@/features/dialog-viewer/helpers";

describe("getChoicePreviewFitViewPadding", () => {
  afterEach(() => {
    document.documentElement.style.fontSize = "";
  });

  it("returns uniform padding when the node editor is closed", () => {
    expect(getChoicePreviewFitViewPadding(false)).toBe(
      CHOICE_PREVIEW_FIT_VIEW_PADDING,
    );
  });

  it("reserves the right-hand node editor panel when it is open", () => {
    document.documentElement.style.fontSize = "16px";
    Object.defineProperty(window, "innerWidth", {
      configurable: true,
      value: 1280,
    });

    expect(getChoicePreviewFitViewPadding(true)).toEqual({
      top: CHOICE_PREVIEW_FIT_VIEW_PADDING,
      left: CHOICE_PREVIEW_FIT_VIEW_PADDING,
      bottom: CHOICE_PREVIEW_FIT_VIEW_PADDING,
      right: `${NODE_EDITOR_WIDTH_REM * 16 + 16}px`,
    });
  });
});
