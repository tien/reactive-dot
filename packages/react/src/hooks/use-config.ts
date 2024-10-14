import { ConfigContext } from "../contexts/index.js";
import { ReactiveDotError } from "@reactive-dot/core";
import { useContext } from "react";

/**
 * Hook for getting the current config.
 *
 * @returns The current config
 */
export function useConfig() {
  const config = useContext(ConfigContext);

  if (config === undefined) {
    throw new ReactiveDotError("No config provided");
  }

  return config;
}
