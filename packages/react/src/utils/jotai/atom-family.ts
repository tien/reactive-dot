import { objectId } from "../object-id.js";

export type AtomFamily<TArguments extends unknown[], TAtomType> = {
  (...args: TArguments): TAtomType;
  delete: (...args: TArguments) => boolean;
};

export function atomFamily<TArguments extends unknown[], TAtomType>(
  initializeAtom: (...args: TArguments) => TAtomType,
  getKey?: (...args: TArguments) => unknown,
): AtomFamily<TArguments, TAtomType> {
  const empty = Symbol("empty");
  const atoms = new Map<unknown, TAtomType>();

  const _getKey =
    getKey ??
    ((...args: TArguments) =>
      args.length === 0
        ? empty
        : args.length === 1
          ? args[0]
          : args.map(objectId).join());

  return Object.assign(
    (...args: TArguments) => {
      const key = _getKey(...args);

      return (
        atoms.get(key) ?? atoms.set(key, initializeAtom(...args)).get(key)!
      );
    },
    { delete: (...args: TArguments) => atoms.delete(_getKey(...args)) },
  );
}
