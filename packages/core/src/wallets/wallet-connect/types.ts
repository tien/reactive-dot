export type SignerPayloadJSON = {
  /**
   * The ss-58 encoded address.
   */
  address: string;

  /**
   * The id of the asset used to pay fees, in hex.
   */
  assetId?: number | object;

  /**
   * The checkpoint hash of the block, in hex.
   */
  blockHash: `0x${string}`;

  /**
   * The checkpoint block number, in hex.
   */
  blockNumber: `0x${string}`;

  /**
   * The era for this transaction, in hex.
   */
  era: `0x${string}`;

  /**
   * The genesis hash of the chain, in hex.
   */
  genesisHash: `0x${string}`;

  /**
   * The metadataHash for the CheckMetadataHash SignedExtension, as hex.
   */
  metadataHash?: `0x${string}`;

  /**
   * The encoded method (with arguments) in hex.
   */
  method: string;

  /**
   * The mode for the CheckMetadataHash SignedExtension, in hex.
   */
  mode?: number;

  /**
   * The nonce for this transaction, in hex.
   */
  nonce: `0x${string}`;

  /**
   * The current spec version for the runtime.
   */
  specVersion: `0x${string}`;

  /**
   * The tip for this transaction, in hex.
   */
  tip: `0x${string}`;

  /**
   * The current transaction version for the runtime.
   */
  transactionVersion: `0x${string}`;

  /**
   * The applicable signed extensions for this runtime.
   */
  signedExtensions: string[];

  /**
   * The version of the extrinsic we are dealing with.
   */
  version: number;
};
