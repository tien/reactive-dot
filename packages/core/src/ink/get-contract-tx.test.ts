import { getInkContractTx } from "./get-contract-tx.js";
import type { PolkadotSigner } from "polkadot-api";
import { expect, it, vi } from "vitest";

vi.mock("./address.js", () => ({
  toH160Bytes: vi.fn(() => "destBytes"),
}));

vi.mock("polkadot-api", () => ({
  AccountId: () => ({ dec: (pub: string) => "ss58:" + pub }),
}));

const dryRunResult = {
  gas_required: 123n,
  storage_deposit: { value: 456n },
};

function makeApi() {
  return {
    apis: {
      ReviveApi: {
        call: vi.fn(() => Promise.resolve(dryRunResult)),
      },
    },
    tx: {
      Revive: {
        call: vi.fn(() => "txObject"),
      },
    },
  };
}

function makeInkClient(mutates: boolean, encoded = "encodedData") {
  return {
    message: vi.fn((_name: string) => ({
      attributes: { mutates },
      encode: vi.fn(() => encoded),
    })),
  };
}

const signer = { publicKey: "myPubKey" } as unknown as PolkadotSigner;
const contract = "contractAddress";
const messageName = "someMessage";

it("throws if message is readonly (mutates=false)", async () => {
  const api = makeApi();
  const inkClient = makeInkClient(false);

  await expect(
    // @ts-expect-error api is mocked
    getInkContractTx(api, inkClient, signer, contract, messageName, {}),
  ).rejects.toThrow(
    `Readonly message ${messageName} cannot be used in a mutating transaction`,
  );
});

it("calls API with defaults when no data/value/options provided", async () => {
  const api = makeApi();
  const inkClient = makeInkClient(true);
  const tx = await getInkContractTx(
    // @ts-expect-error api is mocked
    api,
    inkClient,
    signer,
    contract,
    messageName,
    {},
  );

  expect(api.apis.ReviveApi.call).toHaveBeenCalledWith(
    "ss58:myPubKey",
    "destBytes",
    0n,
    undefined,
    undefined,
    "encodedData",
    {},
  );
  expect(api.tx.Revive.call).toHaveBeenCalledWith({
    dest: "destBytes",
    value: 0n,
    gas_limit: dryRunResult.gas_required,
    storage_deposit_limit: dryRunResult.storage_deposit.value,
    data: "encodedData",
  });
  expect(tx).toBe("txObject");
});
