import { useEffect, useRef, useState } from "react";

import type {
  SpellcheckPreference,
  SpellcheckState,
} from "@/shared/types/spellcheck-preferences";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";

export const Writing = () => {
  const [state, setState] = useState<SpellcheckState | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const mounted = useRef(false);
  const pending = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const api = window.spellcheckPreferences;
    if (api) {
      void api
        .get()
        .then((value) => {
          if (mounted.current) {
            setState(value);
            setError(value.error);
          }
        })
        .catch(() => {
          if (mounted.current)
            setError(
              "Could not load spelling preferences. Please reopen Settings to try again.",
            );
        });
    }
    return () => {
      mounted.current = false;
    };
  }, []);
  const change = async (preference: SpellcheckPreference) => {
    const api = window.spellcheckPreferences;
    if (!api || pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      const next = await api.set(preference);
      if (mounted.current) {
        setState(next);
        setError(next.error);
      }
    } catch {
      // A lost response may follow a successful main-process write. Re-read before allowing another change.
      try {
        const current = await api.get();
        if (mounted.current) {
          setState(current);
          setError(
            "Could not confirm the change. Current settings are shown; please try again.",
          );
        }
      } catch {
        if (mounted.current) {
          setState(null);
          setError(
            "Could not reach spelling preferences. Please reopen Settings to try again.",
          );
        }
      }
    } finally {
      pending.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  if (!window.spellcheckPreferences)
    return <p>Spelling preferences are unavailable in this desktop build.</p>;
  return (
    <div className="space-y-5" aria-busy={busy}>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {!state && !error && <p role="status">Loading spelling preferences…</p>}
      {state && (
        <>
          <div className="flex items-center gap-3">
            <Checkbox
              id="spellcheck-enabled"
              checked={state.enabled}
              disabled={busy}
              onCheckedChange={(checked) =>
                void change({ ...state, enabled: checked === true })
              }
            />
            <Label htmlFor="spellcheck-enabled">Check spelling as I type</Label>
          </div>
          {state.languagesManagedByOS ? (
            <p className="text-sm text-muted-foreground">
              On macOS, spelling languages are managed by your system and
              detected automatically.
            </p>
          ) : (
            <fieldset disabled={busy || !state.enabled} className="space-y-3">
              <legend className="mb-2 font-medium">Spelling languages</legend>
              <p className="text-sm text-muted-foreground">
                Select the languages you write in. New dictionaries may need an
                internet connection.
              </p>
              <div className="max-h-48 space-y-3 overflow-y-auto rounded-md border p-3">
                {state.availableLanguages.map((language) => (
                  <div key={language} className="flex items-center gap-3">
                    <Checkbox
                      id={`spelling-${language}`}
                      checked={state.languages.includes(language)}
                      onCheckedChange={(checked) =>
                        void change({
                          ...state,
                          languages:
                            checked === true
                              ? [...state.languages, language]
                              : state.languages.filter(
                                  (item) => item !== language,
                                ),
                        })
                      }
                    />
                    <Label htmlFor={`spelling-${language}`}>{language}</Label>
                  </div>
                ))}
              </div>
              {state.languages.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  With no languages selected, the spellchecker uses English
                  (US).
                </p>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => void change({ ...state, languages: [] })}
              >
                Reset languages to default
              </Button>
            </fieldset>
          )}
          <p className="text-sm text-muted-foreground">
            Your custom dictionary words are kept when you change these
            settings.
          </p>
          {busy && (
            <p role="status" className="text-sm text-muted-foreground">
              Saving spelling preferences…
            </p>
          )}
        </>
      )}
    </div>
  );
};
