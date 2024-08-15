---
"@reactive-dot/react": patch
---

Implemented `atomFamily` using `WeakMap`: this change allows for the automatic garbage collection of unused values, improving memory efficiency and overall performance.
