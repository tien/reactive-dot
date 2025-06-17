import { chainIdKey } from "../keys.js";
import { withSetup } from "../test-utils.js";
import { useQuery } from "./use-query.js";
import {
  delay,
  mockedTypedApi,
  multiQueries,
  singleContractQuery,
  singleQuery,
  streamingQueries,
} from "@reactive-dot/test/tests/query.js";
import { describe, expect, it, vi } from "vitest";

await vi.hoisted(async () => {
  const { mockInternals } = await import("@reactive-dot/test/tests/query.js");
  mockInternals();
});

vi.mock("./use-typed-api.js", () => ({
  useTypedApiPromise: vi.fn(async () => mockedTypedApi),
}));

describe("useQuery", () => {
  it("fetches single queries", async () => {
    const { result } = withSetup(() => useQuery(singleQuery), {
      [chainIdKey]: "test-chain",
    });

    const data = (await result).data;

    expect(data.value).toMatchInlineSnapshot(`"test-value"`);
  });

  it("fetches single contract queries", async () => {
    const { result } = withSetup(() => useQuery(singleContractQuery), {
      [chainIdKey]: "test-chain",
    });

    const data = (await result).data;

    expect(data.value).toMatchInlineSnapshot(`
      [
        "contract-0x",
        {
          "instruction": "read-storage",
          "path": "",
        },
      ]
    `);
  });

  it("fetches multi queries", async () => {
    const { result } = withSetup(() => useQuery(multiQueries), {
      [chainIdKey]: "test-chain",
    });

    const data = (await result).data;

    expect(data.value).toMatchInlineSnapshot(`
      [
        "test-value",
        "storage-value-key",
        [
          "storage-value-key1",
          "storage-value-key2",
        ],
        "api-value-key",
        [
          "api-value-key1",
          "api-value-key2",
        ],
        [
          [
            "contract-0x",
            {
              "instruction": "read-storage",
              "path": "",
            },
          ],
          [
            "contract-0x",
            {
              "instruction": "read-storage",
              "key": "test_key",
              "path": "test_storage",
            },
          ],
          [
            [
              "contract-0x",
              {
                "directives": {
                  "stream": undefined,
                },
                "instruction": "read-storage",
                "key": "test_key1",
                "path": "test_storage",
              },
            ],
            [
              "contract-0x",
              {
                "directives": {
                  "stream": undefined,
                },
                "instruction": "read-storage",
                "key": "test_key2",
                "path": "test_storage",
              },
            ],
          ],
          [
            "contract-0x",
            {
              "body": {
                "data": "test-data",
              },
              "instruction": "send-message",
              "name": "test_message",
            },
          ],
          [
            [
              "contract-0x",
              {
                "body": {
                  "data": "test-data1",
                },
                "directives": {
                  "stream": undefined,
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
            [
              "contract-0x",
              {
                "body": {
                  "data": "test-data2",
                },
                "directives": {
                  "stream": undefined,
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
          ],
          [
            [
              "contract-0x",
              {
                "body": {
                  "data": "test-data1",
                },
                "directives": {
                  "stream": undefined,
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
            [
              "contract-0x",
              {
                "body": {
                  "data": "test-data2",
                },
                "directives": {
                  "stream": undefined,
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
          ],
        ],
        [
          [
            [
              "contract-0x",
              {
                "instruction": "read-storage",
                "path": "",
              },
            ],
            [
              "contract-0x",
              {
                "instruction": "read-storage",
                "key": "test_key",
                "path": "test_storage",
              },
            ],
            [
              [
                "contract-0x",
                {
                  "directives": {
                    "stream": undefined,
                  },
                  "instruction": "read-storage",
                  "key": "test_key1",
                  "path": "test_storage",
                },
              ],
              [
                "contract-0x",
                {
                  "directives": {
                    "stream": undefined,
                  },
                  "instruction": "read-storage",
                  "key": "test_key2",
                  "path": "test_storage",
                },
              ],
            ],
            [
              "contract-0x",
              {
                "body": {
                  "data": "test-data",
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
            [
              [
                "contract-0x",
                {
                  "body": {
                    "data": "test-data1",
                  },
                  "directives": {
                    "stream": undefined,
                  },
                  "instruction": "send-message",
                  "name": "test_message",
                },
              ],
              [
                "contract-0x",
                {
                  "body": {
                    "data": "test-data2",
                  },
                  "directives": {
                    "stream": undefined,
                  },
                  "instruction": "send-message",
                  "name": "test_message",
                },
              ],
            ],
          ],
          [
            [
              "contract-0x",
              {
                "instruction": "read-storage",
                "path": "",
              },
            ],
            [
              "contract-0x",
              {
                "instruction": "read-storage",
                "key": "test_key",
                "path": "test_storage",
              },
            ],
            [
              [
                "contract-0x",
                {
                  "directives": {
                    "stream": undefined,
                  },
                  "instruction": "read-storage",
                  "key": "test_key1",
                  "path": "test_storage",
                },
              ],
              [
                "contract-0x",
                {
                  "directives": {
                    "stream": undefined,
                  },
                  "instruction": "read-storage",
                  "key": "test_key2",
                  "path": "test_storage",
                },
              ],
            ],
            [
              "contract-0x",
              {
                "body": {
                  "data": "test-data",
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
            [
              [
                "contract-0x",
                {
                  "body": {
                    "data": "test-data1",
                  },
                  "directives": {
                    "stream": undefined,
                  },
                  "instruction": "send-message",
                  "name": "test_message",
                },
              ],
              [
                "contract-0x",
                {
                  "body": {
                    "data": "test-data2",
                  },
                  "directives": {
                    "stream": undefined,
                  },
                  "instruction": "send-message",
                  "name": "test_message",
                },
              ],
            ],
          ],
        ],
      ]
    `);
  });

  it.skip("streams queries", async () => {
    const { result } = withSetup(() => useQuery(streamingQueries), {
      [chainIdKey]: "test-chain",
    });

    const data = (await result).data;

    expect(data.value).toMatchInlineSnapshot(`
      [
        [
          "storage-value-Symbol(delay)",
          "storage-value-Symbol(delay)",
        ],
        [
          "api-value-Symbol(delay)",
          "api-value-Symbol(delay)",
        ],
        [
          [
            [
              "contract-0x",
              {
                "directives": {
                  "stream": true,
                },
                "instruction": "read-storage",
                "key": Symbol(delay),
                "path": "test_storage",
              },
            ],
            [
              "contract-0x",
              {
                "directives": {
                  "stream": true,
                },
                "instruction": "read-storage",
                "key": Symbol(delay),
                "path": "test_storage",
              },
            ],
          ],
          [
            [
              "contract-0x",
              {
                "body": Symbol(delay),
                "directives": {
                  "stream": true,
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
            [
              "contract-0x",
              {
                "body": Symbol(delay),
                "directives": {
                  "stream": true,
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
          ],
        ],
        [
          [
            [
              "contract-0x",
              {
                "directives": {
                  "stream": true,
                },
                "instruction": "read-storage",
                "key": Symbol(delay),
                "path": "test_storage",
              },
            ],
          ],
          [
            [
              "contract-0x",
              {
                "directives": {
                  "stream": true,
                },
                "instruction": "read-storage",
                "key": Symbol(delay),
                "path": "test_storage",
              },
            ],
          ],
        ],
        [
          [
            [
              [
                "contract-0x",
                {
                  "directives": {
                    "stream": true,
                  },
                  "instruction": "read-storage",
                  "key": Symbol(delay),
                  "path": "test_storage",
                },
              ],
            ],
            [
              [
                "contract-0x",
                {
                  "directives": {
                    "stream": true,
                  },
                  "instruction": "read-storage",
                  "key": Symbol(delay),
                  "path": "test_storage",
                },
              ],
            ],
          ],
          [
            [
              [
                "contract-0x",
                {
                  "directives": {
                    "stream": true,
                  },
                  "instruction": "read-storage",
                  "key": Symbol(delay),
                  "path": "test_storage",
                },
              ],
            ],
            [
              [
                "contract-0x",
                {
                  "directives": {
                    "stream": true,
                  },
                  "instruction": "read-storage",
                  "key": Symbol(delay),
                  "path": "test_storage",
                },
              ],
            ],
          ],
        ],
      ]
    `);

    delay.resolve();
    await delay.promise;

    expect(data.value).toMatchInlineSnapshot(`
      [
        [
          "storage-value-Symbol(delay)",
          "storage-value-Symbol(delay)",
        ],
        [
          "api-value-Symbol(delay)",
          "api-value-Symbol(delay)",
        ],
        [
          [
            [
              "contract-0x",
              {
                "directives": {
                  "stream": true,
                },
                "instruction": "read-storage",
                "key": Symbol(delay),
                "path": "test_storage",
              },
            ],
            [
              "contract-0x",
              {
                "directives": {
                  "stream": true,
                },
                "instruction": "read-storage",
                "key": Symbol(delay),
                "path": "test_storage",
              },
            ],
          ],
          [
            [
              "contract-0x",
              {
                "body": Symbol(delay),
                "directives": {
                  "stream": true,
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
            [
              "contract-0x",
              {
                "body": Symbol(delay),
                "directives": {
                  "stream": true,
                },
                "instruction": "send-message",
                "name": "test_message",
              },
            ],
          ],
        ],
        [
          [
            [
              "contract-0x",
              {
                "directives": {
                  "stream": true,
                },
                "instruction": "read-storage",
                "key": Symbol(delay),
                "path": "test_storage",
              },
            ],
          ],
          [
            [
              "contract-0x",
              {
                "directives": {
                  "stream": true,
                },
                "instruction": "read-storage",
                "key": Symbol(delay),
                "path": "test_storage",
              },
            ],
          ],
        ],
        [
          [
            [
              [
                "contract-0x",
                {
                  "directives": {
                    "stream": true,
                  },
                  "instruction": "read-storage",
                  "key": Symbol(delay),
                  "path": "test_storage",
                },
              ],
            ],
            [
              [
                "contract-0x",
                {
                  "directives": {
                    "stream": true,
                  },
                  "instruction": "read-storage",
                  "key": Symbol(delay),
                  "path": "test_storage",
                },
              ],
            ],
          ],
          [
            [
              [
                "contract-0x",
                {
                  "directives": {
                    "stream": true,
                  },
                  "instruction": "read-storage",
                  "key": Symbol(delay),
                  "path": "test_storage",
                },
              ],
            ],
            [
              [
                "contract-0x",
                {
                  "directives": {
                    "stream": true,
                  },
                  "instruction": "read-storage",
                  "key": Symbol(delay),
                  "path": "test_storage",
                },
              ],
            ],
          ],
        ],
      ]
    `);
  });
});
