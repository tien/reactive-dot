export type CreateStorageOptions = {
  key: string;
  storage: Storage;
};

export class KeyedStorage implements Omit<Storage, "length" | "key" | "clear"> {
  readonly key: string;

  #storage: Storage;

  constructor(options: CreateStorageOptions) {
    this.key = options.key;
    this.#storage = options.storage;
  }

  getItem = (key: string) => this.#storage.getItem(this.#prefixKey(key));

  removeItem = (key: string) => this.#storage.removeItem(this.#prefixKey(key));

  setItem = (key: string, value: string) =>
    this.#storage.setItem(this.#prefixKey(key), value);

  #prefixKey = (key: string) => `${this.key}/${key}`;
}
