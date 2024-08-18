import type { Config } from "@reactive-dot/core";
import { atom } from "jotai";

export const configAtom = atom<Config>({ chains: {} });

export const chainConfigsAtom = atom((get) => get(configAtom).chains);
