const refreshSymbol = Symbol("refresh");

export type Refreshable<T> = T & {
  /**
   * @internal
   */
  [refreshSymbol]: () => void;
};

export function refreshable<T extends object>(value: T, refresh: () => void) {
  return Object.assign(value, { [refreshSymbol]: refresh }) as Refreshable<T>;
}

export function refresh(value: Refreshable<unknown>) {
  value[refreshSymbol]();
}
