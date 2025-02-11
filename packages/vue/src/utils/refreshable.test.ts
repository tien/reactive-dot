import { refresh, refreshable, type Refreshable } from "./refreshable.js";
import { expect, it, vi } from "vitest";

it("should call the refresh function when refresh is called", () => {
  const obj = {};
  const refreshFn = vi.fn();
  const refreshableObj = refreshable(obj, refreshFn);

  refresh(refreshableObj as Refreshable<typeof obj>);

  expect(refreshFn).toHaveBeenCalledTimes(1);
});

it("should return the original object with the refresh function attached", () => {
  const obj = { a: 1 };
  const refreshFn = vi.fn();
  const refreshableObj = refreshable(obj, refreshFn);

  expect(refreshableObj).toBe(obj);
});

it("should work with different types of objects", () => {
  const obj1 = { a: 1 };
  const refreshFn1 = vi.fn();
  const refreshableObj1 = refreshable(obj1, refreshFn1);

  refresh(refreshableObj1 as Refreshable<typeof obj1>);

  expect(refreshFn1).toHaveBeenCalledTimes(1);

  const obj2 = [1, 2, 3];
  const refreshFn2 = vi.fn();
  const refreshableObj2 = refreshable(obj2, refreshFn2);

  refresh(refreshableObj2 as Refreshable<typeof obj2>);

  expect(refreshFn2).toHaveBeenCalledTimes(1);

  const obj3 = () => {};
  const refreshFn3 = vi.fn();
  const refreshableObj3 = refreshable(obj3, refreshFn3);

  refresh(refreshableObj3 as Refreshable<typeof obj3>);

  expect(refreshFn3).toHaveBeenCalledTimes(1);
});

it("should allow calling refresh multiple times", () => {
  const obj = {};
  const refreshFn = vi.fn();
  const refreshableObj = refreshable(obj, refreshFn);

  refresh(refreshableObj as Refreshable<typeof obj>);
  refresh(refreshableObj as Refreshable<typeof obj>);
  refresh(refreshableObj as Refreshable<typeof obj>);

  expect(refreshFn).toHaveBeenCalledTimes(3);
});
