import { main, Context, Operation, Controls } from 'effection';

type World<T = unknown> = Context<T> & Controls<T>;

let World: World;
export function spawn<T>(operation: Operation) {
  return World.spawn<T>(operation);
}

beforeEach(() => {
  World = main(undefined) as World<unknown>;
});

afterEach(() => {
  World.halt();
});