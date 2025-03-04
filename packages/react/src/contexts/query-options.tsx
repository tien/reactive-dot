import { createContext, useMemo, type PropsWithChildren } from "react";

export const SubscriptionContext = createContext({ active: true });

type SubscriptionProps = PropsWithChildren<{
  active: boolean;
}>;

/**
 * React context to control subscription options.
 *
 * @param props - Component props
 * @returns React element
 */
export function QueryOptionsProvider({ active, children }: SubscriptionProps) {
  return (
    <SubscriptionContext value={useMemo(() => ({ active }), [active])}>
      {children}
    </SubscriptionContext>
  );
}
