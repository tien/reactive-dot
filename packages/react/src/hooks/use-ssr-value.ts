import { useConfig } from "./use-config.js";
import { useState, useEffect } from "react";

/**
 * @internal
 * @group Hooks
 */
export function useSsrValue<T>(clientValue: T, serverValue: T) {
  const enabled = useConfig().ssr ?? false;

  const [currentValue, setCurrentValue] = useState(
    enabled ? serverValue : clientValue,
  );

  useEffect(
    () => {
      if (enabled) {
        // eslint-disable-next-line @eslint-react/hooks-extra/no-direct-set-state-in-use-effect
        setCurrentValue(clientValue);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return currentValue;
}
