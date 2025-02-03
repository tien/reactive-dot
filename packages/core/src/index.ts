export type { AsyncValue } from "./async-state.js";
export type { ChainId } from "./chains.js";
export { defineConfig, type ChainConfig, type Config } from "./config.js";
export { MutationError, QueryError, ReactiveDotError } from "./errors.js";
export { Query } from "./query-builder.js";
export type { Register } from "./register.js";
export { Storage } from "./storage.js";
export { idle, pending } from "./symbols.js";

export {
  /**
   * @deprecated Use the "/internal/actions.js" subpath export instead.
   */
  aggregateWallets,
} from "./actions/aggregate-wallets.js";
export {
  /**
   * @deprecated Use the "/internal/actions.js" subpath export instead.
   */
  connectWallet,
} from "./actions/connect-wallet.js";
export {
  /**
   * @deprecated Use the "/internal/actions.js" subpath export instead.
   */
  disconnectWallet,
} from "./actions/disconnect-wallet.js";
export {
  /**
   * @deprecated Use the "/internal/actions.js" subpath export instead.
   */
  getAccounts,
} from "./actions/get-accounts.js";
export {
  /**
   * @deprecated Use the "/internal/actions.js" subpath export instead.
   */
  getBlock,
} from "./actions/get-block.js";
export {
  /**
   * @deprecated Use the "/internal/actions.js" subpath export instead.
   */
  unstable_getBlockExtrinsics,
} from "./actions/get-block-extrinsics.js";
export {
  /**
   * @deprecated Use the "/internal/actions.js" subpath export instead.
   */
  getClient,
} from "./actions/get-client.js";
export {
  /**
   * @deprecated Use the "/internal/actions.js" subpath export instead.
   */
  getConnectedWallets,
} from "./actions/get-connected-wallets.js";
export {
  /**
   * @deprecated Use the "/internal/actions.js" subpath export instead.
   */
  initializeWallets,
} from "./actions/initialize-wallets.js";
export {
  /**
   * @deprecated Use the "/internal/actions.js" subpath export instead.
   */
  preflight,
  /**
   * @deprecated Use the "/internal/actions.js" subpath export instead.
   */
  query,
} from "./actions/query.js";
