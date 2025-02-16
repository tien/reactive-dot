const objectIds = new WeakMap<Exclude<object, null>, string>();

export function objectId(object: unknown) {
  if (object === null || typeof object !== "object") {
    return object;
  }

  return (
    objectIds.get(object) ??
    objectIds.set(object, globalThis.crypto.randomUUID()).get(object)!
  );
}
