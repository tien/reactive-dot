export class BaseError extends Error {
  static from<T>(error: T, message?: string) {
    return new this(
      message ?? (error instanceof Error ? error.message : undefined),
      { cause: error },
    );
  }
}

export class QueryError extends BaseError {}

export class MutationError extends BaseError {}

/**
 * @deprecated Renamed to {@link BaseError}.
 */
export const ReactiveDotError = BaseError;
