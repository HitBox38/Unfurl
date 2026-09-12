import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it, vi } from "vitest";
import { NodeSearch } from "@/features/dialog-viewer/components/node-search";

it("prioritizes exact names over content matches and supports keyboard selection", async () => {
  const user = userEvent.setup();
  const nodes = [
    { name: "Advice", content: ["Try fighting"], choices: [], metadata: {} },
    { name: "fighting", content: [], choices: [], metadata: {} },
  ];
  const select = vi.fn();
  render(<NodeSearch nodes={nodes} onSelect={select} />);
  await user.type(
    screen.getByRole("textbox", { name: "Find a node" }),
    "fighting",
  );
  expect(screen.getByRole("status")).toHaveTextContent("2 matching nodes");
  await user.keyboard("{Enter}");
  expect(select).toHaveBeenCalledWith(nodes[1]);
});
