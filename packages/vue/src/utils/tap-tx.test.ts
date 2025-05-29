import type { MutationEvent } from "../types.js";
import { tapTx } from "./tap-tx.js";
import { MutationError } from "@reactive-dot/core";
import type { GenericTransaction } from "@reactive-dot/core/internal.js";
import type { TxEvent } from "polkadot-api";
import { of, throwError, lastValueFrom } from "rxjs";
import { describe, it, expect } from "vitest";
import { ref } from "vue";

describe("tapTx", () => {
  const chainId = 1 as const;
  const dummyTx = {
    decodedCall: { method: "0x123", args: [] },
  } as unknown as GenericTransaction;

  it("should set pending then success with data", async () => {
    const mutationRef = ref<MutationEvent | undefined>();
    const payload = { foo: "bar" } as unknown as TxEvent;

    // apply operator
    const result$ = tapTx(mutationRef, chainId, dummyTx)(of(payload));

    // pending should be set immediately
    expect(mutationRef.value).toMatchObject({
      status: "pending",
      chainId,
      call: dummyTx.decodedCall,
    });

    const received = await lastValueFrom(result$);
    expect(received).toEqual(payload);
    expect(mutationRef.value).toMatchObject({
      status: "success",
      data: payload,
    });
  });

  it("should set pending then error on failure", async () => {
    const mutationRef = ref<MutationEvent | undefined>();
    const err = new Error("oops");

    // apply operator
    const result$ = tapTx(mutationRef, chainId, dummyTx)(throwError(() => err));

    // pending should be set immediately
    expect(mutationRef.value).toMatchObject({
      status: "pending",
      chainId,
      call: dummyTx.decodedCall,
    });

    await expect(lastValueFrom(result$)).rejects.toBe(err);
    expect(mutationRef.value).toMatchObject({ status: "error" });
    expect(
      (mutationRef.value as Extract<MutationEvent, { status: "error" }>).error,
    ).toBeInstanceOf(MutationError);
  });
});
