import type { Finality } from "../types.js";
import { InkQuery } from "./query-builder.js";
import { describe, expect, it } from "vitest";

describe("initialization", () => {
  it("should initialize with empty instructions", () => {
    const query = new InkQuery();
    expect(query.instructions).toEqual([]);
  });

  it("should freeze instructions array", () => {
    const query = new InkQuery();
    expect(Object.isFrozen(query.instructions)).toBe(true);
  });
});

describe("rootStorage", () => {
  it("should add root storage read instruction without options", () => {
    const query = new InkQuery().rootStorage();
    expect(query.instructions).toEqual([
      {
        instruction: "read-storage",
        path: "",
        key: undefined,
        at: undefined,
      },
    ]);
  });

  it("should add root storage read instruction with finality", () => {
    const query = new InkQuery().rootStorage({ at: "finalized" as Finality });
    expect(query.instructions).toEqual([
      {
        instruction: "read-storage",
        path: "",
        key: undefined,
        at: "finalized",
      },
    ]);
  });
});

describe("storage", () => {
  it("should add storage read instruction without key", () => {
    const query = new InkQuery().storage("test-path");
    expect(query.instructions).toEqual([
      {
        instruction: "read-storage",
        path: "test-path",
        key: undefined,
        at: undefined,
      },
    ]);
  });

  it("should add storage read instruction with key", () => {
    const query = new InkQuery().storage("test-path", "key-value");
    expect(query.instructions).toEqual([
      {
        instruction: "read-storage",
        path: "test-path",
        key: "key-value",
        at: undefined,
      },
    ]);
  });

  it("should add storage read instruction with key and options", () => {
    const query = new InkQuery().storage("test-path", "key-value", {
      at: "finalized" as Finality,
    });
    expect(query.instructions).toEqual([
      {
        instruction: "read-storage",
        path: "test-path",
        key: "key-value",
        at: "finalized",
      },
    ]);
  });
});

describe("storages", () => {
  it("should add multi storage read instruction without options", () => {
    const query = new InkQuery().storages("test-path", ["key1", "key2"]);
    expect(query.instructions).toEqual([
      {
        instruction: "read-storage",
        multi: true,
        path: "test-path",
        keys: ["key1", "key2"],
        at: undefined,
      },
    ]);
  });

  it("should add multi storage read instruction with options", () => {
    const query = new InkQuery().storages("test-path", ["key1", "key2"], {
      at: "finalized" as Finality,
    });
    expect(query.instructions).toEqual([
      {
        instruction: "read-storage",
        multi: true,
        path: "test-path",
        keys: ["key1", "key2"],
        at: "finalized",
      },
    ]);
  });
});

describe("message", () => {
  it("should add message send instruction without body", () => {
    const query = new InkQuery().message("test-message");
    expect(query.instructions).toEqual([
      {
        instruction: "send-message",
        name: "test-message",
        body: undefined,
        at: undefined,
      },
    ]);
  });

  it("should add message send instruction with body", () => {
    const query = new InkQuery().message("test-message", { foo: "bar" });
    expect(query.instructions).toEqual([
      {
        instruction: "send-message",
        name: "test-message",
        body: { foo: "bar" },
        at: undefined,
      },
    ]);
  });

  it("should add message send instruction with body and options", () => {
    const query = new InkQuery().message(
      "test-message",
      { foo: "bar" },
      { at: "finalized" as Finality },
    );
    expect(query.instructions).toEqual([
      {
        instruction: "send-message",
        name: "test-message",
        body: { foo: "bar" },
        at: "finalized",
      },
    ]);
  });
});

describe("messages", () => {
  it("should add multi message send instruction without options", () => {
    const query = new InkQuery().messages("test-message", [
      { foo: "bar1" },
      { foo: "bar2" },
    ]);
    expect(query.instructions).toEqual([
      {
        instruction: "send-message",
        multi: true,
        name: "test-message",
        bodies: [{ foo: "bar1" }, { foo: "bar2" }],
        at: undefined,
      },
    ]);
  });

  it("should add multi message send instruction with options", () => {
    const query = new InkQuery().messages(
      "test-message",
      [{ foo: "bar1" }, { foo: "bar2" }],
      { at: "finalized" as Finality },
    );
    expect(query.instructions).toEqual([
      {
        instruction: "send-message",
        multi: true,
        name: "test-message",
        bodies: [{ foo: "bar1" }, { foo: "bar2" }],
        at: "finalized",
      },
    ]);
  });
});

describe("chaining", () => {
  it("should support chaining multiple operations", () => {
    const query = new InkQuery()
      .storage("path1", "key1")
      .message("msg1", { data: "value" })
      .storages("path2", ["key2", "key3"])
      .messages("msg2", [{ item: 1 }, { item: 2 }])
      .rootStorage({ at: "finalized" as Finality });

    expect(query.instructions).toHaveLength(5);
    expect(query.instructions[0]).toEqual({
      instruction: "read-storage",
      path: "path1",
      key: "key1",
      at: undefined,
    });
    expect(query.instructions[4]).toEqual({
      instruction: "read-storage",
      path: "",
      key: undefined,
      at: "finalized",
    });
  });

  it("should create a new instance for each chain call", () => {
    const query1 = new InkQuery();
    const query2 = query1.storage("path", "key");
    const query3 = query2.message("msg");

    expect(query1).not.toBe(query2);
    expect(query2).not.toBe(query3);
    expect(query1.instructions).toHaveLength(0);
    expect(query2.instructions).toHaveLength(1);
    expect(query3.instructions).toHaveLength(2);
  });
});
