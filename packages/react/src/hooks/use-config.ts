import { ConfigContext } from "../contexts/config.js";
import { BaseError } from "@reactive-dot/core";
import { use } from "react";

/**
 * Hook for getting the current config.
 *
 * @group Hooks
 * @returns The current config
 */
export function useConfig() {
  const config = use(ConfigContext);

  if (config === undefined) {
    throw new BaseError("No config provided");
  }

  return config;
}
