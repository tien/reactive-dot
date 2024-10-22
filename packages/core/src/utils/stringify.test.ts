import { stringify } from "./stringify.js";
import { Binary } from "polkadot-api";
import { expect, it } from "vitest";

it("matches snapshot", () => {
  const string = stringify({
    undefined: undefined,
    null: null,
    boolean: true,
    integer: 1,
    bigInteger: 420n,
    float: 1.5,
    string: "Hello, world!",
    object: { b: 1, c: 2, a: 0 },
    array: [4, 2, 6, 1],
    binary: Binary.fromText("Hello, world!"),
  });

  expect(string).toMatchSnapshot();
});
