import type { ChainId, idle, Query } from "@reactive-dot/core";
import type {
  QueryInstruction,
  ChainDescriptorOf,
  Falsy,
  FalsyGuard,
  FlatHead,
  InferQueryPayload,
} from "@reactive-dot/core/internal.js";

export type ChainHookOptions<
  TChainId extends ChainId | undefined = ChainId | undefined,
> = {
  /**
   * Override default chain ID
   */
  chainId?: TChainId | undefined;
};

export type QueryArgument<TChainId extends ChainId | undefined> =
  | Query<
      QueryInstruction<ChainDescriptorOf<TChainId>>[],
      ChainDescriptorOf<TChainId>
    >
  | ((
      query: Query<[], ChainDescriptorOf<TChainId>>,
    ) =>
      | Query<
          QueryInstruction<ChainDescriptorOf<TChainId>>[],
          ChainDescriptorOf<TChainId>
        >
      | Falsy)
  | Falsy;

export type InferQueryArgumentResult<
  TChainId extends ChainId | undefined,
  TQuery extends QueryArgument<TChainId>,
> = TQuery extends Falsy
  ? typeof idle
  : TQuery extends Query
    ? FlatHead<InferQueryPayload<TQuery>>
    : FalsyGuard<
        ReturnType<Exclude<TQuery, Falsy | Query>>,
        FlatHead<
          InferQueryPayload<
            Exclude<ReturnType<Exclude<TQuery, Falsy | Query>>, Falsy>
          >
        >,
        typeof idle
      >;
