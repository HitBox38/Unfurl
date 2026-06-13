import type { StorageProps } from "./types";

export const resolveDefault = <T>(value: StorageProps<T>["defaultValue"]) =>
  typeof value === "function" ? (value as () => T)() : value;
