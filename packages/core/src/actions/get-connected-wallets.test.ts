import type { Wallet } from "../wallets/wallet.js";
import { getConnectedWallets } from "./get-connected-wallets.js";
import { BehaviorSubject, of } from "rxjs";
import { expect, it } from "vitest";

it("should return empty array when no wallets provided", () =>
  new Promise<void>((resolve) => {
    const result = getConnectedWallets([]);

    result.subscribe((wallets) => {
      expect(wallets).toEqual([]);
      resolve();
    });
  }));

it("should filter out disconnected wallets", () =>
  new Promise<void>((resolve) => {
    const wallet1 = {
      connected$: new BehaviorSubject(true),
    } as unknown as Wallet;

    const wallet2 = {
      connected$: new BehaviorSubject(false),
    } as unknown as Wallet;

    const result = getConnectedWallets([wallet1, wallet2]);

    result.subscribe((wallets) => {
      expect(wallets).toEqual([wallet1]);
      resolve();
    });
  }));

it("should handle async wallet array input", () =>
  new Promise<void>((resolve) => {
    const wallet1 = {
      connected$: new BehaviorSubject(true),
    } as unknown as Wallet;

    const wallet2 = {
      connected$: new BehaviorSubject(true),
    } as unknown as Wallet;

    const asyncWallets = Promise.resolve([wallet1, wallet2]);
    const result = getConnectedWallets(asyncWallets);

    result.subscribe((wallets) => {
      expect(wallets).toEqual([wallet1, wallet2]);
      resolve();
    });
  }));

it("should handle observable wallet array input", () =>
  new Promise<void>((resolve) => {
    const wallet = {
      connected$: new BehaviorSubject(true),
    } as unknown as Wallet;

    const walletsObservable = of([wallet]);
    const result = getConnectedWallets(walletsObservable);

    result.subscribe((wallets) => {
      expect(wallets).toEqual([wallet]);
      resolve();
    });
  }));

it("should update when wallet connection status changes", () =>
  new Promise<void>((resolve) => {
    const connected$ = new BehaviorSubject(true);
    const wallet = {
      connected$,
    } as unknown as Wallet;

    const result = getConnectedWallets([wallet]);
    let emissionCount = 0;

    result.subscribe((wallets) => {
      if (emissionCount === 0) {
        emissionCount++;
        expect(wallets).toEqual([wallet]);
        connected$.next(false);
      } else if (emissionCount === 1) {
        emissionCount++;
        expect(wallets).toEqual([]);
        resolve();
      }
    });
  }));
