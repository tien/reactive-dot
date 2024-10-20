import type { Config } from "./config.js";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Register {}

export type ResolvedRegister = {
  config: Register extends { config: infer config extends Config }
    ? config
    : Config;
};
