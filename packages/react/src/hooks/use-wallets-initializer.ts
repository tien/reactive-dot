import { useConfig } from "./use-config.js";
import { walletsAtom } from "./use-wallets.js";
import {
  idle,
  initializeWallets,
  pending,
  type AsyncValue,
  type ReactiveDotError,
} from "@reactive-dot/core";
import { useAtomCallback } from "jotai/utils";
import { useCallback, useState } from "react";

/**
 * Hook for initializing wallets.
 * @internal
 *
 * @returns The initialization state and initialize function
 */
export function useWalletsInitializer() {
  const config = useConfig();
  const [state, setState] = useState<AsyncValue<true, ReactiveDotError>>(idle);

  const initialize = useAtomCallback(
    useCallback(
      async (get) => {
        setState(pending);
        await initializeWallets(await get(walletsAtom(config)));
        setState(true);
      },
      [config],
    ),
  );

  return [state, initialize] as [
    state: typeof state,
    initialize: typeof initialize,
  ];
}
