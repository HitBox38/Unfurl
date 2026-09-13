import { readFileSync, renameSync, writeFileSync } from "node:fs";
import type { Session } from "electron";

import {
  isSpellcheckPreference,
  type SpellcheckPreference,
  type SpellcheckState,
} from "@/shared/types/spellcheck-preferences";

type SpellcheckSession = Pick<
  Session,
  | "isSpellCheckerEnabled"
  | "getSpellCheckerLanguages"
  | "setSpellCheckerEnabled"
  | "setSpellCheckerLanguages"
  | "availableSpellCheckerLanguages"
>;

export const createSpellcheckPreferences = (
  session: SpellcheckSession,
  file: string,
  platform = process.platform,
) => {
  const languagesManagedByOS = platform === "darwin";
  let error: string | undefined;
  const get = (): SpellcheckState => ({
    enabled: session.isSpellCheckerEnabled(),
    languages: session.getSpellCheckerLanguages(),
    availableLanguages: languagesManagedByOS
      ? []
      : session.availableSpellCheckerLanguages,
    languagesManagedByOS,
    error,
  });
  const supported = (preference: SpellcheckPreference) =>
    languagesManagedByOS ||
    preference.languages.every((language) =>
      session.availableSpellCheckerLanguages.includes(language),
    );
  const apply = (preference: SpellcheckPreference) => {
    if (!languagesManagedByOS)
      session.setSpellCheckerLanguages(preference.languages);
    session.setSpellCheckerEnabled(preference.enabled);
  };
  try {
    const stored: unknown = JSON.parse(readFileSync(file, "utf8"));
    if (isSpellcheckPreference(stored) && supported(stored)) apply(stored);
    else
      error =
        "Saved spelling preferences were invalid. Current device defaults are in use.";
  } catch (cause) {
    if ((cause as NodeJS.ErrnoException).code !== "ENOENT") {
      error =
        "Could not restore spelling preferences. Check your settings and try saving again.";
    }
  }
  const set = (value: unknown): SpellcheckState => {
    if (!isSpellcheckPreference(value) || !supported(value)) {
      return {
        ...get(),
        error: "Choose supported spelling languages and try again.",
      };
    }
    const previous = get();
    try {
      apply(value);
      const effective = get();
      writeFileSync(
        `${file}.tmp`,
        JSON.stringify({
          enabled: effective.enabled,
          languages: effective.languages,
        }),
        "utf8",
      );
      renameSync(`${file}.tmp`, file);
      error = undefined;
    } catch {
      error =
        "Could not save spelling preferences. Your previous settings are still in use. Please try again.";
      try {
        apply(previous);
      } catch {
        error =
          "Could not apply or restore spelling preferences. The current state is shown below; please restart Unfurl.";
      }
    }
    return get();
  };
  return { get, set };
};
