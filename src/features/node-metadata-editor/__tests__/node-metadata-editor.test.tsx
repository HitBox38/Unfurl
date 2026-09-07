import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { beforeEach, describe, expect, it } from "vitest";

import { NodeMetadataEditor } from "@/features/node-metadata-editor";
import { createProject } from "@/shared/lib/projects-storage";
import { useJsonDataStore } from "@/shared/stores";
import type { StoryData } from "@/shared/types";
import { Accordion } from "@/shared/ui/accordion";

const story: StoryData = { title: null, start: null, nodes: [] };

const Harness = () => {
  const methods = useForm({ defaultValues: { metadata: {} } });
  return (
    <FormProvider {...methods}>
      <Accordion type="multiple" defaultValue={["metadata"]}>
        <NodeMetadataEditor />
      </Accordion>
    </FormProvider>
  );
};

describe("NodeMetadataEditor", () => {
  beforeEach(() => {
    useJsonDataStore.getState().reset();
  });

  it("renders the fields defined by the active project's metadata config", () => {
    const project = createProject({
      name: "RPG",
      metadataConfig: {
        config: [
          { name: "gold", sign: "$", type: "number", label: "Gold" },
          { name: "met", sign: "!", type: "boolean", label: "Met before" },
        ],
      },
    });
    useJsonDataStore.getState().setJson(story, "file", "file-id", project.id);

    render(<Harness />);

    expect(screen.getByLabelText("Gold")).toHaveAttribute("type", "number");
    expect(screen.getByRole("checkbox", { name: "Met before" })).toBeInTheDocument();
  });

  it("renders nothing when the active project has no metadata fields", () => {
    const project = createProject({ name: "Empty" });
    useJsonDataStore.getState().setJson(story, "file", "file-id", project.id);

    const { container } = render(<Harness />);

    expect(container.querySelector('[data-slot="accordion-item"]')).toBeNull();
  });
});
