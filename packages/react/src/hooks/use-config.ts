import { ConfigContext } from "../contexts/config.js";
import { ReactiveDotError } from "@reactive-dot/core";
// eslint-disable-next-line @eslint-react/no-use-context
import { useContext } from "react";

/**
 * Hook for getting the current config.
 *
 * @returns The current config
 */
export function useConfig() {
  // eslint-disable-next-line @eslint-react/no-use-context
  const config = useContext(ConfigContext);

  if (config === undefined) {
    throw new ReactiveDotError("No config provided");
  }

  return config;
}
