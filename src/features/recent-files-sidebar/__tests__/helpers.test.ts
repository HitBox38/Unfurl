import { describe, expect, it } from "vitest";

import { buildSidebarGroups } from "@/features/recent-files-sidebar/helpers";
import type { EditableFileRecord } from "@/shared/lib/editable-files-storage";
import type { ProjectRecord, StoryData } from "@/shared/types";

const story: StoryData = { title: "Intro", start: null, nodes: [] };

const project = (id: string, name: string): ProjectRecord => ({
  id,
  name,
  source: { kind: "local" },
  metadataConfig: { config: [] },
  createdAt: 1,
  updatedAt: 1,
});

const file = (
  partial: Pick<EditableFileRecord, "id" | "projectId" | "name">,
): EditableFileRecord => ({
  fileType: "twee",
  content: story,
  updatedAt: 1,
  ...partial,
});

describe("buildSidebarGroups", () => {
  const rpg = project("rpg", "RPG");
  const shop = project("shop", "Shop dialogs");
  const filesByProject = new Map([
    ["rpg", [file({ id: "a", projectId: "rpg", name: "quest" })]],
    ["shop", []],
  ]);

  it("keeps empty projects when not searching", () => {
    const groups = buildSidebarGroups([rpg, shop], filesByProject, "");
    expect(groups.map((group) => group.project.id)).toEqual(["rpg", "shop"]);
    expect(groups[1]?.files).toEqual([]);
  });

  it("hides groups that match neither project name nor files", () => {
    const groups = buildSidebarGroups([rpg, shop], filesByProject, "quest");
    expect(groups).toHaveLength(1);
    expect(groups[0]?.project.id).toBe("rpg");
  });

  it("shows all files in a group when the project name matches", () => {
    const groups = buildSidebarGroups(
      [rpg, shop],
      new Map([
        [
          "rpg",
          [
            file({ id: "a", projectId: "rpg", name: "quest" }),
            file({ id: "b", projectId: "rpg", name: "other" }),
          ],
        ],
        ["shop", []],
      ]),
      "rpg",
    );
    expect(groups).toHaveLength(1);
    expect(groups[0]?.files.map((item) => item.name)).toEqual([
      "quest",
      "other",
    ]);
  });
});
