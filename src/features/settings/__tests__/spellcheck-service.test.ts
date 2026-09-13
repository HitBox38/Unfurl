import { beforeEach, describe, expect, it, vi } from "vitest";

import { createSpellcheckPreferences } from "@/../electron/spellcheck-preferences";

const disk = vi.hoisted(() => ({
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  renameSync: vi.fn(),
}));
vi.mock("node:fs", () => ({ ...disk, default: disk }));

const makeSession = () => {
  let enabled = true;
  let languages = ["en-US"];
  return {
    availableSpellCheckerLanguages: ["en-US", "fr", "he"],
    isSpellCheckerEnabled: () => enabled,
    getSpellCheckerLanguages: () => [...languages],
    setSpellCheckerEnabled: vi.fn((value: boolean) => {
      enabled = value;
    }),
    setSpellCheckerLanguages: vi.fn((value: string[]) => {
      languages = [...value];
    }),
  };
};
beforeEach(() => {
  vi.resetAllMocks();
  disk.readFileSync.mockImplementation(() => {
    throw Object.assign(new Error("missing"), { code: "ENOENT" });
  });
});

describe("desktop spelling service", () => {
  it("keeps defaults and applies, saves, and restores language/enabled preferences", () => {
    const session = makeSession();
    const service = createSpellcheckPreferences(
      session,
      "settings.json",
      "win32",
    );
    expect(service.get()).toMatchObject({
      enabled: true,
      languages: ["en-US"],
      error: undefined,
    });
    expect(
      service.set({ enabled: false, languages: ["fr", "he"] }),
    ).toMatchObject({
      enabled: false,
      languages: ["fr", "he"],
      error: undefined,
    });
    const saved = disk.writeFileSync.mock.calls[0][1];
    expect(disk.renameSync).toHaveBeenCalledWith(
      "settings.json.tmp",
      "settings.json",
    );
    disk.readFileSync.mockReturnValue(saved);
    expect(
      createSpellcheckPreferences(
        makeSession(),
        "settings.json",
        "linux",
      ).get(),
    ).toMatchObject({ enabled: false, languages: ["fr", "he"] });
  });

  it.each([
    null,
    {},
    { enabled: "yes", languages: [] },
    { enabled: false, languages: ["xx-unsupported"] },
    { enabled: true, languages: ["fr", "fr"] },
  ])("rejects invalid payloads without changing the session: %j", (value) => {
    const session = makeSession();
    const service = createSpellcheckPreferences(
      session,
      "settings.json",
      "win32",
    );
    expect(service.set(value).error).toBeTruthy();
    expect(session.setSpellCheckerEnabled).not.toHaveBeenCalled();
    expect(session.setSpellCheckerLanguages).not.toHaveBeenCalled();
    expect(disk.writeFileSync).not.toHaveBeenCalled();
  });

  it("rolls back effective state on disk failure and reports corruption without failing startup", () => {
    disk.readFileSync.mockReturnValue("{bad");
    const service = createSpellcheckPreferences(
      makeSession(),
      "settings.json",
      "win32",
    );
    expect(service.get().error).toBeTruthy();
    disk.writeFileSync.mockImplementation(() => {
      throw new Error("disk full");
    });
    expect(service.set({ enabled: false, languages: ["fr"] })).toMatchObject({
      enabled: true,
      languages: ["en-US"],
      error: expect.any(String),
    });
  });

  it("never sets macOS languages and exposes the OS-managed capability", () => {
    const session = makeSession();
    const service = createSpellcheckPreferences(
      session,
      "settings.json",
      "darwin",
    );
    expect(
      service.set({ enabled: false, languages: ["OS-locale"] }),
    ).toMatchObject({
      enabled: false,
      languages: ["en-US"],
      languagesManagedByOS: true,
      availableLanguages: [],
    });
    expect(session.setSpellCheckerLanguages).not.toHaveBeenCalled();
  });
});
