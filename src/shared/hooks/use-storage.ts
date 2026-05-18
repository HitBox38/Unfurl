import { useCallback, useEffect, useRef, useState } from "react";

export const STORAGE_EVENT = "storage-change";

export interface StorageProps<T> {
  key: string;
  defaultValue: (() => T) | T;
  storage?: Storage;
  serialize?: (value: T) => string;
  deserialize?: (str: string) => T;
}

const resolveDefault = <T>(value: StorageProps<T>["defaultValue"]) =>
  typeof value === "function" ? (value as () => T)() : value;

/**
 * Two-way bind state to a Web Storage instance (default: localStorage). The
 * value stays in sync across hook instances on the same window via a
 * dispatched `storage-change` CustomEvent — this side-steps the usual
 * cross-tab-only behavior of the native `storage` event.
 */
export const useStorage = <T>({
  key,
  defaultValue,
  storage = localStorage,
  serialize = JSON.stringify,
  deserialize = JSON.parse,
}: StorageProps<T>) => {
  const initFromStorage = useCallback(() => {
    const valueInStorage = storage.getItem(key);
    if (valueInStorage) {
      try {
        return deserialize(valueInStorage);
      } catch {
        storage.removeItem(key);
      }
    }
    return resolveDefault(defaultValue);
  }, [defaultValue, deserialize, key, storage]);

  const [value, setValue] = useState<T>(initFromStorage);

  const prevKeyRef = useRef(key);

  useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== key) {
      storage.removeItem(prevKey);
    }
    prevKeyRef.current = key;

    if (!storage.getItem(key)) {
      storage.setItem(key, serialize(resolveDefault(defaultValue)));
    }
  }, [defaultValue, key, serialize, storage]);

  const updateStorage = useCallback(
    (newValue: T) => {
      setValue(newValue);
      storage.setItem(key, serialize(newValue));
      window.dispatchEvent(
        new CustomEvent(STORAGE_EVENT, { detail: { key, newValue } }),
      );
    },
    [key, serialize, storage],
  );

  const fromStorage = useCallback(() => {
    const newValue = initFromStorage();
    setValue(newValue);
    return newValue;
  }, [initFromStorage]);

  useEffect(() => {
    const onChange = (e: CustomEvent<{ key: string; newValue: T }>) => {
      if (e.detail.key === key) {
        setValue(e.detail.newValue);
      }
    };
    window.addEventListener(STORAGE_EVENT, onChange as EventListener);
    return () => {
      window.removeEventListener(STORAGE_EVENT, onChange as EventListener);
    };
  }, [key]);

  return [value, updateStorage, fromStorage] as const;
};
