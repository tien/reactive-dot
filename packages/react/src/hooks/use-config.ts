import { ConfigContext } from "../contexts/config.js";
import { ReactiveDotError } from "@reactive-dot/core";
import { use } from "react";

/**
 * Hook for getting the current config.
 *
 * @returns The current config
 */
export function useConfig() {
  const config = use(ConfigContext);

  if (config === undefined) {
    throw new ReactiveDotError("No config provided");
  }

  return config;
}
