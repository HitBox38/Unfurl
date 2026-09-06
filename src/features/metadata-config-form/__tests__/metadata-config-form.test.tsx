import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { MetadataConfigForm } from "@/features/metadata-config-form";
import { INVALID_CONFIG_FILE_REASON } from "@/features/metadata-config-form/constants";
import { createProject, getProject } from "@/shared/lib/projects-storage";
import type { MetadataConfigTemplate } from "@/shared/types";

const emptyConfig: MetadataConfigTemplate = { config: [] };

const goldConfig: MetadataConfigTemplate = {
  config: [{ name: "gold", sign: "$", type: "number", label: "Gold" }],
};

const FormHost = ({
  projectId,
  initialConfig,
}: {
  projectId: string;
  initialConfig: MetadataConfigTemplate;
}) => {
  const methods = useForm<MetadataConfigTemplate>({
    defaultValues: initialConfig,
  });

  return (
    <FormProvider {...methods}>
      <MetadataConfigForm projectId={projectId} initialConfig={initialConfig} />
    </FormProvider>
  );
};

const renderForm = (
  initialConfig: MetadataConfigTemplate,
  projectName = "RPG",
) => {
  const project = createProject({ name: projectName, metadataConfig: initialConfig });
  render(<FormHost projectId={project.id} initialConfig={initialConfig} />);
  return project;
};

describe("MetadataConfigForm", () => {
  it("shows an empty state until a field is added", async () => {
    const user = userEvent.setup();
    renderForm(emptyConfig);

    expect(screen.getByText(/no metadata fields yet/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /add field/i }));

    expect(screen.queryByText(/no metadata fields yet/i)).not.toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /^name$/i })).toBeInTheDocument();
  });

  it("removes a field row", async () => {
    const user = userEvent.setup();
    renderForm(goldConfig);

    expect(screen.getByRole("textbox", { name: /^name$/i })).toHaveValue("gold");

    await user.click(screen.getByRole("button", { name: /remove gold/i }));

    expect(screen.getByText(/no metadata fields yet/i)).toBeInTheDocument();
  });

  it("imports immediately when the form has no fields", async () => {
    const user = userEvent.setup();
    const project = renderForm(emptyConfig);

    const input = screen.getByLabelText(/import config file/i, {
      selector: "input",
    });
    const file = new File([JSON.stringify(goldConfig)], "config.json", {
      type: "application/json",
    });
    await user.upload(input, file);

    await waitFor(() =>
      expect(getProject(project.id)?.metadataConfig).toEqual(goldConfig),
    );
    expect(screen.getByRole("textbox", { name: /^name$/i })).toHaveValue("gold");
  });

  it("asks before replacing existing fields", async () => {
    const user = userEvent.setup();
    const project = renderForm(goldConfig);
    const replacement: MetadataConfigTemplate = {
      config: [{ name: "hp", sign: "#", type: "number", label: "HP" }],
    };

    const input = screen.getByLabelText(/import config file/i, {
      selector: "input",
    });
    await user.upload(
      input,
      new File([JSON.stringify(replacement)], "next.json", {
        type: "application/json",
      }),
    );

    expect(await screen.findByRole("status")).toHaveTextContent(/replace 1 field/i);
    expect(getProject(project.id)?.metadataConfig).toEqual(goldConfig);

    await user.click(screen.getByRole("button", { name: /^replace$/i }));

    await waitFor(() =>
      expect(getProject(project.id)?.metadataConfig).toEqual(replacement),
    );
    expect(screen.getByRole("textbox", { name: /^name$/i })).toHaveValue("hp");
  });

  it("reports an invalid import file", async () => {
    const user = userEvent.setup();
    renderForm(emptyConfig);

    const input = screen.getByLabelText(/import config file/i, {
      selector: "input",
    });
    await user.upload(
      input,
      new File(["{nope"], "bad.json", { type: "application/json" }),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      INVALID_CONFIG_FILE_REASON,
    );
  });
});
