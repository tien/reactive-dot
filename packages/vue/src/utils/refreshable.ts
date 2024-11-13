// TODO: weird TypeScript error
const refreshSymbol = Symbol("refresh") as unknown as "_refresh";

export type Refreshable<T> = T & {
  /**
   * @internal
   */
  [refreshSymbol]: () => void;
};

export function refreshable<T extends object>(value: T, refresh: () => void) {
  return Object.assign(value, { [refreshSymbol]: refresh });
}

export function refresh(value: Refreshable<unknown>) {
  value[refreshSymbol]();
}
