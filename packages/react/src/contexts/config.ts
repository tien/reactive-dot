import type { Config } from "@reactive-dot/core";
import { createContext } from "react";

export const ConfigContext = createContext<Config | undefined>(undefined);
