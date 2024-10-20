export type { Chains, CommonDescriptor } from "./config.js";
export type { MutationEvent } from "./mutation-event.js";
export {
  type InferQueryPayload,
  type InferQueryResponse,
  type MultiInstruction,
  type QueryInstruction,
} from "./query-builder.js";
export type { Falsy, FalsyGuard, FlatHead } from "./types.js";
export { flatHead, maybeThen, stringify, toObservable } from "./utils.js";
