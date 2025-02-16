import { atomFamilyWithErrorCatcher } from "./atom-family-with-error-catcher.js";
import { atom, createStore } from "jotai";
import { atomWithObservable } from "jotai/utils";
import { of, throwError } from "rxjs";
import { beforeEach, expect, it } from "vitest";

let store: ReturnType<typeof createStore>;

beforeEach(() => {
  store = createStore();
});

it("should create an atom family", () => {
  const myAtomFamily = atomFamilyWithErrorCatcher(
    (withErrorCatcher, param: string) => {
      return withErrorCatcher(atom)(`Hello ${param}`);
    },
  );

  const atomA = myAtomFamily("Jotai");
  const atomB = myAtomFamily("Jotai");

  expect(atomA).toBe(atomB);
});

it("should return different atoms for different params", () => {
  const myAtomFamily = atomFamilyWithErrorCatcher(
    (withErrorCatcher, param: string) => {
      return withErrorCatcher(atom)(`Hello ${param}`);
    },
  );

  const atomA = myAtomFamily("World");
  const atomB = myAtomFamily("Jotai");

  expect(atomA).not.toBe(atomB);
});

it("should catch errors in synchronous reads", () => {
  const myAtomFamily = atomFamilyWithErrorCatcher(
    (withErrorCatcher, param: string) => {
      return withErrorCatcher(atom)(() => {
        if (param === "Error") {
          throw new Error("Intentional Error");
        }

        return `Hello ${param}`;
      });
    },
  );

  expect(store.get(myAtomFamily("World"))).toBe("Hello World");
  expect(() => store.get(myAtomFamily("Error"))).toThrow("Intentional Error");
});

it("should catch errors in Promise reads", async () => {
  const myAtomFamily = atomFamilyWithErrorCatcher(
    (withErrorCatcher, param: string) => {
      return withErrorCatcher(atom)(async () => {
        if (param === "Error") {
          throw new Error("Intentional Promise Error");
        }

        return `Hello ${param}`;
      });
    },
  );

  expect(await store.get(myAtomFamily("World"))).toBe("Hello World");
  await expect(() => store.get(myAtomFamily("Error"))).rejects.toThrow(
    "Intentional Promise Error",
  );
});

it("should catch errors in Observable reads", async () => {
  const myAtomFamily = atomFamilyWithErrorCatcher(
    (withErrorCatcher, param: string) => {
      return withErrorCatcher(atomWithObservable)(() =>
        param === "Error"
          ? throwError(() => new Error("Intentional Observable Error"))
          : of(`Hello ${param}`),
      );
    },
  );

  expect(await store.get(myAtomFamily("World"))).toBe("Hello World");
  expect(() => store.get(myAtomFamily("Error"))).toThrow(
    "Intentional Observable Error",
  );
});
