import { useAtomValue as useAtomValueBase } from "jotai";

export const useAtomValue: typeof useAtomValueBase = (
  atom: Parameters<typeof useAtomValueBase>[0],
  options: Parameters<typeof useAtomValueBase>[1],
) => useAtomValueBase(atom, { unstable_promiseStatus: true, ...options });
