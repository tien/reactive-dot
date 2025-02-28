---
sidebar_position: 3
---

# Query performance

All query hooks in ReactiveDOT create subscriptions to the underlying data sources. These subscriptions ensure that your components always reflect the latest data changes. However, it's important to manage these subscriptions effectively to avoid performance issues.

## Subscription lifecycle

A new subscription is created the first time a query hook is mounted. When the last component that uses the query unmounts, the subscription is automatically cleaned up. Therefore, it's crucial to ensure components unmount when they are no longer needed.

## Unmounting components

Always remember to unmount components when they are no longer visible or required. This is the most straightforward way to manage subscriptions and prevent unnecessary data fetching and updates.

## Controlling subscriptions

In some scenarios, you might not want to unmount components (e.g., in an infinite scroll implementation where you only want active subscriptions on visible elements). In such cases, you can use the [`QueryOptionsProvider`](/api/react/function/QueryOptionsProvider) component to control subscription behavior.

The `QueryOptionsProvider` allows you to disable subscriptions for specific parts of your application. This can be useful for optimizing performance when dealing with a large number of components.

```tsx
import { QueryOptionsProvider } from "@reactive-dot/react";

export default function ParentComponent() {
  // Hook implementation not included for brevity
  const isVisible = useIsVisible();

  return (
    <QueryOptionsProvider active={isVisible}>
      <YourComponent />
    </QueryOptionsProvider>
  );
}
```
