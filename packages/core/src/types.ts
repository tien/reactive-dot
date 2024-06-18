export type Gettable<T> = T | PromiseLike<T> | (() => T | PromiseLike<T>);
