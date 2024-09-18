export class ReactiveDotError extends Error {
  static from<T>(error: T, message?: string) {
    return new this(message, { cause: error });
  }
}

export class QueryError extends ReactiveDotError {}

export class MutationError extends ReactiveDotError {}
