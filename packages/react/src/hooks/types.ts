import type { ChainId, idle, Query } from "@reactive-dot/core";
import type {
  QueryInstruction,
  ChainDescriptorOf,
  Falsy,
  FalsyGuard,
  InferQueryPayload,
} from "@reactive-dot/core/internal.js";

type ChainOptions<TChainId extends ChainId | undefined> = {
  /**
   * Override default chain ID
   */
  chainId: TChainId | undefined;
};

export type ChainHookOptions<
  TChainId extends ChainId | undefined = ChainId | undefined,
> = Partial<ChainOptions<TChainId>>;

export type QueryOptions<TChainId extends ChainId | undefined> =
  ChainOptions<TChainId> & { query: QueryArgument<TChainId> };

export type QueryArgument<TChainId extends ChainId | undefined> =
  | Query<readonly QueryInstruction[], ChainDescriptorOf<TChainId>>
  | ((
      query: Query<[], ChainDescriptorOf<TChainId>>,
    ) =>
      | Query<readonly QueryInstruction[], ChainDescriptorOf<TChainId>>
      | Falsy)
  | Falsy;

export type InferQueryArgumentResult<
  TChainId extends ChainId | undefined,
  TQuery extends QueryArgument<TChainId>,
> = TQuery extends Falsy
  ? typeof idle
  : TQuery extends Query
    ? InferQueryPayload<TQuery>
    : FalsyGuard<
        ReturnType<Exclude<TQuery, Falsy | Query>>,
        InferQueryPayload<
          Exclude<ReturnType<Exclude<TQuery, Falsy | Query>>, Falsy>
        >,
        typeof idle
      >;
