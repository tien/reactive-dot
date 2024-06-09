import type { ChainConfig, ChainId } from "../types.js";
import { atom } from "jotai";

export const chainConfigsAtom = atom<Record<ChainId, ChainConfig>>({});
