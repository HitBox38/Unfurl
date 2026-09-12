import { expect, it } from "vitest";
import { CHOICE_PREVIEW_FIT_VIEW_PADDING } from "@/features/dialog-viewer/constants";
import { getChoicePreviewFitViewPadding } from "@/features/dialog-viewer/helpers";

it("uses the available canvas without double-reserving the docked editor", () => {
  expect(getChoicePreviewFitViewPadding(false)).toBe(
    CHOICE_PREVIEW_FIT_VIEW_PADDING,
  );
  expect(getChoicePreviewFitViewPadding(true)).toBe(
    CHOICE_PREVIEW_FIT_VIEW_PADDING,
  );
});
