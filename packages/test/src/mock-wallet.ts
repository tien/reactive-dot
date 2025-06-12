import {
  type PolkadotSignerAccount,
  Wallet,
} from "@reactive-dot/core/wallets.js";
import { BehaviorSubject } from "rxjs";
import { map } from "rxjs/operators";

export class MockWallet extends Wallet {
  readonly id = "mock";

  readonly name = "Mock wallet";

  readonly initialized$ = new BehaviorSubject(false);

  readonly connected$ = new BehaviorSubject(false);

  readonly accounts$ = this.connected$.pipe(
    map((connected) => (connected ? this.#accounts : [])),
  );

  readonly #accounts: PolkadotSignerAccount[];

  constructor(accounts: PolkadotSignerAccount[], connected = false) {
    super();
    this.#accounts = accounts;
    this.connected$.next(connected);
  }

  initialize() {
    this.initialized$.next(true);
  }

  connect() {
    this.connected$.next(true);
  }

  disconnect() {
    this.connected$.next(false);
  }
}
