import * as exports from "./internal.js";
import { expect, it } from "vitest";

it("should match inline snapshot", () =>
  expect(Object.keys(exports)).toMatchInlineSnapshot(`
    [
      "flatHead",
      "nativeTokenInfoFromChainSpecData",
      "stringify",
      "toObservable",
    ]
  `));
