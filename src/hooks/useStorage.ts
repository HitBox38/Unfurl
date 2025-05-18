import { useCallback, useEffect, useRef, useState } from "react";

export interface StorageProps<T> {
  key: string;
  defaultValue: (() => T) | T;
  storage?: Storage;
  serialize?: (value: T) => string;
  deserialize?: (str: string) => T;
}

export const STORAGE_EVENT = "storage-change";

const getDefaultValue = <T>(value: StorageProps<T>["defaultValue"]) =>
  typeof value === "function" ? (value as () => T)() : value;

/**
 * Helps in interacting with `localStorage` (or any other given storage) for storing/retrieving info.
 * @param key - the storage key by which the data needs to be stored
 * @param defaultValue - initialized the storage with this value. Note: its used as a dependency, hence needs to keep referential identity.
 * @param storage - preferred storage location. Default: localStorage
 * @param serialize - method to serialize the given data before storing. Default: JSON.stringify
 * @param deserialize - method to deserialize the data after retrieving it. Default: JSON.parse
 *
 * @returns [`value`, `setValue`, `fromStorage`]
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
      } catch (error) {
        storage.removeItem(key);
      }
    }
    return getDefaultValue(defaultValue);
  }, [defaultValue, deserialize, key, storage]);

  const [value, setValue] = useState(initFromStorage);

  const prevKeyRef = useRef(key);

  useEffect(() => {
    const prevKey = prevKeyRef.current;
    if (prevKey !== key) {
      storage.removeItem(prevKey);
    }
    prevKeyRef.current = key;

    if (!storage.getItem(key)) {
      storage.setItem(key, serialize(getDefaultValue(defaultValue)));
    }
  }, [defaultValue, key, serialize, storage]);

  const updateStorage = useCallback(
    (newValue: T) => {
      setValue(newValue);
      storage.setItem(key, serialize(newValue));
      window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key, newValue } }));
    },
    [key, serialize, storage]
  );

  const fromStorage = useCallback(() => {
    const newValue = initFromStorage();
    setValue(newValue);
    return newValue;
  }, [initFromStorage]);

  useEffect(() => {
    const storageChanged = (e: CustomEvent<{ key: string; newValue: T }>) => {
      if (e.detail.key === key) {
        setValue(e.detail.newValue);
      }
    };

    window.addEventListener(STORAGE_EVENT, storageChanged as EventListener);

    return () => {
      window.removeEventListener(STORAGE_EVENT, storageChanged as EventListener);
    };
  }, [key]);

  return [value, updateStorage, fromStorage] as const;
};
