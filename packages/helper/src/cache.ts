function wrapCache<T>(fn: (() => T) | (() => Promise<T>)) {
  let cache: T | undefined;

  return (...args: Parameters<typeof fn>) => {
    if (cache) {
      return cache;
    }

    return fn(...args);
  };
}

export { wrapCache };
