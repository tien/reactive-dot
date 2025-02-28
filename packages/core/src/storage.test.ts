import { Storage, type StorageOptions } from "./storage.js";
import { describe, it, expect, beforeEach } from "vitest";

// Create an in-memory implementation of SimpleStorage for testing.
class InMemoryStorage {
  private store: Record<string, string> = {};

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }
}

describe("Storage", () => {
  let inMemoryStorage: InMemoryStorage;
  let storage: Storage;

  beforeEach(() => {
    inMemoryStorage = new InMemoryStorage();
    const options: StorageOptions = {
      prefix: "test",
      storage: inMemoryStorage,
    };
    storage = new Storage(options);
  });

  it("should set and get an item with prefixed key", () => {
    storage.setItem("key1", "value1");

    // Underlying storage stores value with prefixed key "test/key1"
    expect(inMemoryStorage.getItem("test/key1")).toEqual("value1");
    expect(storage.getItem("key1")).toEqual("value1");
  });

  it("should remove an item with prefixed key", () => {
    storage.setItem("key2", "value2");

    expect(inMemoryStorage.getItem("test/key2")).toEqual("value2");

    storage.removeItem("key2");

    expect(inMemoryStorage.getItem("test/key2")).toBeNull();
  });

  it("should create a joined storage with extended prefix", () => {
    storage.setItem("key3", "value3");
    const joined = storage.join("namespace");
    // The joined storage prefix should be "test/namespace"
    joined.setItem("key4", "value4");

    // Accessing original storage should not find key4 under its prefix "test"
    expect(storage.getItem("key4")).toBeNull();
    // The underlying storage should have the item with key "test/namespace/key4"
    expect(inMemoryStorage.getItem("test/namespace/key4")).toEqual("value4");
  });
});
