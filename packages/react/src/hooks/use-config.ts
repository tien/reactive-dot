import { ConfigContext } from "../contexts/index.js";
import { ReDotError } from "@reactive-dot/core";
import { useContext } from "react";

/**
 * Hook for getting the current config.
 *
 * @returns The current config
 */
export function useConfig() {
  const config = useContext(ConfigContext);

  if (config === undefined) {
    throw new ReDotError("No config provided");
  }
  return config;
}
