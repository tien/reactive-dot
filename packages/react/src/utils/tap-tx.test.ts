import type { MutationEvent } from "../contexts/mutation.js";
import { tapTx } from "./tap-tx.js";
import { MutationError, pending, type ChainId } from "@reactive-dot/core";
import type { GenericTransaction } from "@reactive-dot/core/internal.js";
import { waitFor } from "@testing-library/dom";
import type { TxEvent } from "polkadot-api";
import { Subject, of, throwError, type Observable } from "rxjs";
import { afterEach, beforeEach, expect, it, vi } from "vitest";

let mutationEventSubject: Subject<MutationEvent>;
const chainId: ChainId = "test-chain" as ChainId;

const mockTransaction: GenericTransaction = {
  decodedCall: {
    // @ts-expect-error Mocking a transaction call
    pallet: "system",
    method: "remark",
    args: { _remark: "test" },
  },
  getEncodedData: vi.fn(),
  getEstimatedFees: vi.fn(),
  getHash: vi.fn(),
  getNonce: vi.fn(),
  getTip: vi.fn(),
  getTxLimit: vi.fn(),
  getTxVersion: vi.fn(),
  getValidity: vi.fn(),
  isSigned: vi.fn(),
  sign: vi.fn(),
  submit: vi.fn(),
};

const mockUUID = globalThis.crypto.randomUUID();

beforeEach(() => {
  mutationEventSubject = new Subject<MutationEvent>();
  vi.spyOn(globalThis.crypto, "randomUUID").mockReturnValue(mockUUID);
});

afterEach(() => {
  vi.restoreAllMocks();
});

it("should emit a pending event initially", () => {
  const source$ = of({ type: "finalized", txHash: "0x" } as TxEvent);
  const events: MutationEvent[] = [];
  mutationEventSubject.subscribe((event) => events.push(event));

  source$
    .pipe(tapTx(mutationEventSubject, chainId, mockTransaction))
    .subscribe();

  waitFor(() => expect(events.length).toBe(1));
  expect(events[0]).toEqual({
    id: mockUUID,
    chainId,
    call: mockTransaction.decodedCall,
    value: pending,
  });
});

it("should emit subsequent events with the correct value", () => {
  const txEvent1 = { type: "typeA", value: "valueA" } as unknown as TxEvent;
  const txEvent2 = { type: "typeB", value: "valueB" } as unknown as TxEvent;
  const source$ = of(txEvent1, txEvent2);
  const events: MutationEvent[] = [];
  mutationEventSubject.subscribe((event) => events.push(event));

  source$
    .pipe(tapTx(mutationEventSubject, chainId, mockTransaction))
    .subscribe();

  expect(events.length).toBe(3); // pending + 2 events
  expect(events[0]?.value).toBe(pending);
  expect(events[1]).toEqual({
    id: mockUUID,
    chainId,
    call: mockTransaction.decodedCall,
    value: txEvent1,
  });
  expect(events[2]).toEqual({
    id: mockUUID,
    chainId,
    call: mockTransaction.decodedCall,
    value: txEvent2,
  });
});

it("should emit a MutationError event when the source observable errors", () => {
  const error = new Error("Test error");
  const source$ = throwError(() => error) as Observable<TxEvent>;
  const events: MutationEvent[] = [];
  mutationEventSubject.subscribe((event) => events.push(event));

  source$
    .pipe(tapTx(mutationEventSubject, chainId, mockTransaction))
    .subscribe({
      error: () => {
        /* consume error */
      },
    });

  expect(events.length).toBe(2); // pending + error
  expect(events[0]?.value).toBe(pending);
  expect(events[1]).toEqual({
    id: mockUUID,
    chainId,
    call: mockTransaction.decodedCall,
    value: MutationError.from(error),
  });
});

it("should re-throw the error after emitting the MutationError event", () => {
  const error = new Error("Test error");
  const source$ = throwError(() => error) as Observable<TxEvent>;
  const errorHandler = vi.fn();

  source$
    .pipe(tapTx(mutationEventSubject, chainId, mockTransaction))
    .subscribe({
      error: errorHandler,
    });

  expect(errorHandler).toHaveBeenCalledTimes(1);
  expect(errorHandler).toHaveBeenCalledWith(error);
});

it("should handle an empty source observable", () => {
  const source$ = new Subject<TxEvent>(); // or EMPTY
  const events: MutationEvent[] = [];
  mutationEventSubject.subscribe((event) => events.push(event));

  const subscription = source$
    .pipe(tapTx(mutationEventSubject, chainId, mockTransaction))
    .subscribe();
  source$.complete(); // Complete the observable to ensure no more events are emitted

  expect(events.length).toBe(1); // Only the initial pending event
  expect(events[0]).toEqual({
    id: mockUUID,
    chainId,
    call: mockTransaction.decodedCall,
    value: pending,
  });
  subscription.unsubscribe();
});
