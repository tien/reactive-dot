import type { Observable } from "rxjs";

export type Gettable<T> = T | PromiseLike<T> | (() => T | PromiseLike<T>);

export type MaybeAsync<T> = T | Promise<T> | Observable<T>;
