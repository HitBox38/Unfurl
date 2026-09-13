import { useCallback, useState, useSyncExternalStore } from "react";

import type { createPreference } from "@/shared/lib/preference-store";

export const usePreference = <T extends string | boolean>(
  preference: ReturnType<typeof createPreference<T>>,
) => {
  const value = useSyncExternalStore(preference.subscribe, preference.read);
  const [error, setError] = useState(false);
  const setValue = useCallback(
    (next: T) => {
      const saved = preference.write(next);
      setError(!saved);
      return saved;
    },
    [preference],
  );
  return [value, setValue, error] as const;
};
