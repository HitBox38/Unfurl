export const SPELLCHECK_GET_PREFERENCES = "spellcheck:get-preferences";
export const SPELLCHECK_SET_PREFERENCES = "spellcheck:set-preferences";

export type SpellcheckPreference = { enabled: boolean; languages: string[] };
export type SpellcheckState = SpellcheckPreference & {
  availableLanguages: string[];
  languagesManagedByOS: boolean;
  error?: string;
};
export type SpellcheckPreferencesApi = {
  get: () => Promise<SpellcheckState>;
  set: (preference: SpellcheckPreference) => Promise<SpellcheckState>;
};

export const isSpellcheckPreference = (
  value: unknown,
): value is SpellcheckPreference => {
  if (!value || typeof value !== "object") return false;
  const preference = value as Partial<SpellcheckPreference>;
  return (
    typeof preference.enabled === "boolean" &&
    Array.isArray(preference.languages) &&
    preference.languages.length <= 100 &&
    preference.languages.every(
      (language) => typeof language === "string" && language.length <= 35,
    ) &&
    new Set(preference.languages).size === preference.languages.length
  );
};
