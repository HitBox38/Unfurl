import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { MetadataConfig } from "@/features/metadata-config";
import { EveryWhereDialog } from "@/shared/components";
import { createProject, getProject } from "@/shared/lib/projects-storage";

it("keeps incomplete fields open and saves them after correction", async () => {
  const user = userEvent.setup();
  const project = createProject({ name: "Validation" });
  render(
    <>
      <MetadataConfig project={project} />
      <EveryWhereDialog />
    </>,
  );
  await user.click(screen.getByRole("button", { name: /metadata config/i }));
  await user.click(screen.getByRole("button", { name: "Add field" }));
  await user.type(screen.getByRole("textbox", { name: "Name" }), "reputation");
  await user.click(screen.getByRole("button", { name: "Save" }));
  expect(await screen.findByText("Sign is required")).toBeVisible();
  expect(getProject(project.id)?.metadataConfig.config).toHaveLength(0);
  await user.type(screen.getByRole("textbox", { name: "Sign" }), "@@");
  await user.click(screen.getByRole("button", { name: "Save" }));
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
  expect(getProject(project.id)?.metadataConfig.config[0].name).toBe(
    "reputation",
  );
});
