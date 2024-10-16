---
"@reactive-dot/wallet-walletconnect": patch
"@reactive-dot/wallet-ledger": patch
---

Fixed `Wallet.getAccounts` incorrectly used `lastValueFrom` instead of `firstValueFrom`.
