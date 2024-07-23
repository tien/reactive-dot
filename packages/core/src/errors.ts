export class ReDotError extends Error {
  static from<T>(error: T, message?: string) {
    return new this(message, { cause: error });
  }
}

export class QueryError extends ReDotError {}

export class MutationError extends ReDotError {}
