import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useMetadataConfigFormModal } from "@/features/metadata-config-form-modal";
import { createProject, getProject } from "@/shared/lib/projects-storage";
import type { MetadataConfigTemplate } from "@/shared/types";

const config: MetadataConfigTemplate = {
  config: [{ name: "gold", sign: "$", type: "number", label: "Gold" }],
};

describe("useMetadataConfigFormModal", () => {
  it("describes an open form dialog for the project", () => {
    const project = createProject({ name: "RPG", metadataConfig: config });

    const { result } = renderHook(() => useMetadataConfigFormModal(project));

    expect(result.current).toMatchObject({
      isOpen: true,
      isForm: true,
      title: "Metadata configuration",
      formName: "metadata-config",
    });
    expect(result.current.description).toMatch(/custom data fields/i);
  });

  it("saves the submitted config onto the project", () => {
    const project = createProject({ name: "RPG" });
    const { result } = renderHook(() => useMetadataConfigFormModal(project));

    result.current.submitFunction?.(config);

    expect(getProject(project.id)?.metadataConfig).toEqual(config);
  });

  it("keeps import enabled when fields already exist and disables export when empty", () => {
    const filled = createProject({ name: "Filled", metadataConfig: config });
    const empty = createProject({ name: "Empty" });

    const filledActions = renderHook(() => useMetadataConfigFormModal(filled))
      .result.current.functions;
    const emptyActions = renderHook(() => useMetadataConfigFormModal(empty))
      .result.current.functions;

    expect(filledActions?.find((a) => a.name === "Import config")?.disabled).toBeFalsy();
    expect(filledActions?.find((a) => a.name === "Export config")?.disabled).toBe(false);
    expect(emptyActions?.find((a) => a.name === "Import config")?.disabled).toBeFalsy();
    expect(emptyActions?.find((a) => a.name === "Export config")?.disabled).toBe(true);
  });
});
