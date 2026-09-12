export interface StorageProps<T> {
  key: string;
  defaultValue: (() => T) | T;
  storage?: Storage;
  serialize?: (value: T) => string;
  deserialize?: (str: string) => T;
}
