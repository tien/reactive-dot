export class ReDotError extends Error {
  static from<T>(error: T, message?: string): ReDotError {
    return new ReDotError(message, { cause: error });
  }
}

export class QueryError extends ReDotError {
  static override from<T>(error: T, message?: string): QueryError {
    return new QueryError(message, { cause: error });
  }
}

export class MutationError extends ReDotError {
  static override from<T>(error: T, message?: string): MutationError {
    return new MutationError(message, { cause: error });
  }
}
