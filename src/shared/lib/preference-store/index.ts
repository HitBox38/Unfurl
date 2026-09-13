export const createPreference = <T extends string | boolean>(
  key: string,
  defaultValue: T,
  isValid: (value: unknown) => value is T,
) => {
  const eventName = `unfurl:preference:${key}`;
  const read = (): T => {
    try {
      const raw = localStorage.getItem(key);
      const value: unknown = raw === null ? defaultValue : JSON.parse(raw);
      return isValid(value) ? value : defaultValue;
    } catch {
      return defaultValue;
    }
  };
  const write = (value: T): boolean => {
    if (!isValid(value)) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      window.dispatchEvent(new Event(eventName));
      return true;
    } catch {
      return false;
    }
  };
  const subscribe = (listener: () => void) => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) listener();
    };
    window.addEventListener(eventName, listener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(eventName, listener);
      window.removeEventListener("storage", onStorage);
    };
  };
  return { read, write, subscribe };
};
