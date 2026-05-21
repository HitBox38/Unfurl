export function withPrototype<T extends object>(obj: T): T {
  let prototype = Object.getPrototypeOf(obj);

  while (prototype && prototype !== Object.prototype) {
    for (const key of Reflect.ownKeys(prototype)) {
      if (key === "constructor" || Object.prototype.hasOwnProperty.call(obj, key)) {
        continue;
      }

      const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
      if (!descriptor) {
        continue;
      }

      if (typeof descriptor.value === "function") {
        Object.defineProperty(obj, key, {
          configurable: true,
          enumerable: true,
          value: (...args: unknown[]) => descriptor.value.apply(obj, args),
          writable: true,
        });
      } else if (descriptor.get) {
        Object.defineProperty(obj, key, {
          configurable: true,
          enumerable: true,
          get: () => descriptor.get?.call(obj),
        });
      }
    }

    prototype = Object.getPrototypeOf(prototype);
  }

  return obj;
}
