type Result<T> =
  | { success: true; value: T }
  | {
      success: false;
      value: {
        type: string;
        value: unknown;
      };
    };

export type UnwrapResult<T> =
  T extends Result<infer _>
    ? T extends { success: true }
      ? T["value"]
      : never
    : T;

export function unwrapResult<T>(result: Result<T>): T;
export function unwrapResult<T>(notResult: T): T;
export function unwrapResult(maybeResult: unknown): unknown {
  if (!isResult(maybeResult)) {
    return maybeResult;
  }

  if (!maybeResult.success) {
    throw new Error(maybeResult.value.type, { cause: maybeResult.value.value });
  }

  return maybeResult.value;
}

function isResult(maybeResult: unknown): maybeResult is Result<unknown> {
  return (
    typeof maybeResult === "object" &&
    maybeResult !== null &&
    "success" in maybeResult &&
    typeof maybeResult["success"] === "boolean" &&
    "value" in maybeResult
  );
}
