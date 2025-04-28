import { atomFamilyWithErrorCatcher } from "../utils/jotai/atom-family-with-error-catcher.js";
import { type Contract } from "@reactive-dot/core/internal.js";
import { getInkClient } from "@reactive-dot/core/internal/actions.js";
import { type Atom, atom } from "jotai";

// TODO: figure out why explicit type annotation is needed
/**
 * @internal
 */
export const inkClientAtom: (
  contract: Contract,
) => Atom<ReturnType<typeof getInkClient>> = atomFamilyWithErrorCatcher(
  (withErrorCatcher, contract: Contract) =>
    withErrorCatcher(atom(() => getInkClient(contract))),
  (contract) => contract.valueOf(),
);
