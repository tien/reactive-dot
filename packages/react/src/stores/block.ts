import { atomFamilyWithErrorCatcher } from "../utils/jotai.js";
import { clientAtom } from "./client.js";
import { type ChainId, type Config, getBlock } from "@reactive-dot/core";
import { atomWithObservable } from "jotai/utils";
import { from } from "rxjs";
import { switchMap } from "rxjs/operators";

export const finalizedBlockAtom = atomFamilyWithErrorCatcher(
  (param: { config: Config; chainId: ChainId }, withErrorCatcher) =>
    withErrorCatcher(atomWithObservable)((get) =>
      from(get(clientAtom(param))).pipe(
        switchMap((client) => getBlock(client, { tag: "finalized" })),
      ),
    ),
  (a, b) => a.config === b.config && a.chainId === b.chainId,
);

export const bestBlockAtom = atomFamilyWithErrorCatcher(
  (param: { config: Config; chainId: ChainId }, withErrorCatcher) =>
    withErrorCatcher(atomWithObservable)((get) =>
      from(get(clientAtom(param))).pipe(
        switchMap((client) => getBlock(client, { tag: "best" })),
      ),
    ),
  (a, b) => a.config === b.config && a.chainId === b.chainId,
);
