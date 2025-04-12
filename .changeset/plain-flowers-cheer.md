---
"@reactive-dot/react": minor
---

Added the ability to refresh a query by using the `options.fetchKey` parameter.

```tsx
import { useState, useTransition } from "react";

function QueryWithRefresh() {
  const [fetchCount, setFetchCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const pendingRewards = useLazyLoadQuery(
    (builder) =>
      builder.runtimeApi("NominationPoolsApi", "pending_rewards", [
        ACCOUNT_ADDRESS,
      ]),
    { fetchKey: fetchCount },
  );

  return (
    <div>
      <p>{pendingRewards.toLocaleString()}</p>
      <button
        onClick={() =>
          startTransition(() => setFetchCount((count) => count + 1))
        }
        disabled={isPending}
      >
        Refresh
      </button>
    </div>
  );
}
```
