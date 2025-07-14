---
"@reactive-dot/core": patch
---

Fixed repeated reconnection attempts after failure. The injected wallet will no longer continue trying to reconnect after the first failed attempt.
