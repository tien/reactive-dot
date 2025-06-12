/* eslint-disable vue/one-component-per-file */
import { lazyValuesKey, mutationEventKey } from "./keys.js";
import type { Component, InjectionKey } from "vue";
import { createApp, defineComponent, h, provide, shallowRef } from "vue";

type InstanceType<V> = V extends { new (...arg: unknown[]): infer X }
  ? X
  : never;
type VM<V> = InstanceType<V> & { unmount: () => void };

export function withSetup<TResult>(
  composable: () => TResult,
  injections: {
    [key: InjectionKey<unknown>]: typeof key extends InjectionKey<infer Value>
      ? Value
      : never;
  } = {},
) {
  let result!: TResult;

  const Comp = defineComponent({
    setup() {
      result = composable();
      return () => h("div");
    },
  });

  const Provider = defineComponent({
    setup() {
      provide(lazyValuesKey, new Map());
      provide(mutationEventKey, shallowRef());
      [
        ...Object.entries(injections),
        ...Object.getOwnPropertySymbols(injections).map(
          (symbol) => [symbol, injections[symbol]] as const,
        ),
      ].forEach(([key, value]) => {
        provide(key, value);
      });
      return () => h(Comp);
    },
  });

  const mounted = mount(Provider);

  return {
    result,
    unmount: mounted.unmount,
  };
}

function mount<V>(Comp: V) {
  const el = document.createElement("div");
  const app = createApp(Comp as Component);
  const unmount = () => app.unmount();
  const comp = app.mount(el) as unknown as VM<V>;
  comp.unmount = unmount;
  return comp;
}
