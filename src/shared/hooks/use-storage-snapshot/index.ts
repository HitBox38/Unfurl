import { useCallback, useSyncExternalStore } from "react";

import { STORAGE_EVENT } from "@/shared/hooks/use-storage";

/**
 * Subscribes to one localStorage key and returns its raw serialized value.
 * The raw string is a stable snapshot (identical between writes), which is
 * what `useSyncExternalStore` needs; callers derive parsed data from it with
 * `useMemo`. Same-window writes are observed through the app's
 * `storage-change` CustomEvent, other windows through the native `storage`
 * event.
 */
export const useStorageSnapshot = (key: string): string | null => {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const onCustomChange = (event: Event) => {
        if ((event as CustomEvent<{ key: string }>).detail?.key === key) {
          onChange();
        }
      };
      const onNativeChange = (event: StorageEvent) => {
        if (event.key === null || event.key === key) {
          onChange();
        }
      };
      window.addEventListener(STORAGE_EVENT, onCustomChange);
      window.addEventListener("storage", onNativeChange);
      return () => {
        window.removeEventListener(STORAGE_EVENT, onCustomChange);
        window.removeEventListener("storage", onNativeChange);
      };
    },
    [key],
  );

  const getSnapshot = useCallback(() => localStorage.getItem(key), [key]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
};
