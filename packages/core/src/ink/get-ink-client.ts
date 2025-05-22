import { type Contract, getContractConfig } from "./contract.js";

export function getInkClient(contract: Contract) {
  return import("polkadot-api/ink").then(({ getInkClient }) =>
    getInkClient(getContractConfig(contract).descriptor),
  );
}
