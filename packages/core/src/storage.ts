export type SimpleStorage = Pick<Storage, "getItem" | "removeItem" | "setItem">;

export type PrefixedStorageOptions = {
  prefix: string;
  storage: SimpleStorage;
};

export class PrefixedStorage<TKey extends string = string>
  implements SimpleStorage
{
  readonly prefix: string;

  #storage: SimpleStorage;

  constructor(options: PrefixedStorageOptions) {
    this.prefix = options.prefix;
    this.#storage = options.storage;
  }

  getItem(key: TKey) {
    return this.#storage.getItem(this.#prefixKey(key));
  }

  removeItem(key: TKey) {
    return this.#storage.removeItem(this.#prefixKey(key));
  }

  setItem(key: TKey, value: string) {
    return this.#storage.setItem(this.#prefixKey(key), value);
  }

  join<TKeyOverride extends string | void = void>(path: string) {
    return new PrefixedStorage<TKeyOverride extends void ? TKey : TKeyOverride>(
      {
        prefix: `${this.prefix}/${path}`,
        storage: this.#storage,
      },
    );
  }

  #prefixKey(key: string) {
    return `${this.prefix}/${key}`;
  }
}

export const defaultStorage = new PrefixedStorage({
  prefix: "@reactive-dot",
  storage: globalThis.localStorage,
});
