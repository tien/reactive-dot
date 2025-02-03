import { getBlock, type GetBlockOptions } from "./get-block.js";
import type { PolkadotClient } from "polkadot-api";
import { of } from "rxjs";
import { expect, it } from "vitest";

type DummyBlock = { id: string };

it("should return the best block when options.tag is 'best'", () =>
  new Promise<void>((resolve) => {
    const fakeBlock: DummyBlock = { id: "best-block" };
    const client = {
      bestBlocks$: of([fakeBlock]),
      finalizedBlock$: of({ id: "finalized-block" }),
    } as unknown as PolkadotClient;

    getBlock(client, { tag: "best" } as GetBlockOptions).subscribe((result) => {
      expect(result).toBe(fakeBlock);
      resolve();
    });
  }));

it("should return the finalized block when options.tag is 'finalized'", () =>
  new Promise<void>((resolve) => {
    const fakeBlock: DummyBlock = { id: "finalized-block" };
    const client = {
      bestBlocks$: of([{ id: "best-block" }]),
      finalizedBlock$: of(fakeBlock),
    } as unknown as PolkadotClient;

    getBlock(client, { tag: "finalized" } as GetBlockOptions).subscribe(
      (result) => {
        expect(result).toBe(fakeBlock);
        resolve();
      },
    );
  }));

it("should return the finalized block when no options are provided", () =>
  new Promise<void>((resolve) => {
    const fakeBlock: DummyBlock = { id: "finalized-block" };
    const client = {
      bestBlocks$: of([{ id: "best-block" }]),
      finalizedBlock$: of(fakeBlock),
    } as unknown as PolkadotClient;

    getBlock(client).subscribe((result) => {
      expect(result).toBe(fakeBlock);
      resolve();
    });
  }));
