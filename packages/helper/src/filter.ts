function filterUndefined<T>(value?: T): value is Exclude<T, null> {
  return value !== undefined;
}

function filterNull<T>(value?: T): value is Exclude<T, null> {
  return value !== null;
}

function filterNil<T>(value?: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

export { filterNil, filterNull, filterUndefined };
