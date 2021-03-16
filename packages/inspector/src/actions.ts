import { createApi, createEffect, createStore } from "effector";
import type { MouseEvent } from "react";
import { getInteractors, ResolvedInteractor } from "./interactors/getInteractors";

export const refresh = createEffect((_event?: MouseEvent<HTMLElement, globalThis.MouseEvent>) => getInteractors());
export const $interactors = createStore<[string, ResolvedInteractor][]>([]).on(
  refresh.doneData,
  (_, interactors) => interactors
);

export const $isLoading = createStore(false);
export const { start, end } = createApi($isLoading, {
  start: () => true,
  end: () => false,
});

export const $code = createStore(localStorage.getItem("interactors_playground") ?? "");
export const { edit } = createApi($code, {
  edit: (_code, value: string) => value,
});

$code.watch((code) => {
  localStorage.setItem("interactors_playground", code);
});

export const $target = createStore<Element | null>(null);
export const { highlight, unhighlight } = createApi($target, {
  highlight: (_element, target: Element) => target,
  unhighlight: () => null,
});

export const $selector = createStore<string | null>(null);
export const { open, close } = createApi($selector, {
  open: (_, selector: string) => selector,
  close: () => null,
});
