import { run, Context, Operation, Controls } from 'effection';

type World<T = unknown> = Context<T> & Controls<T>;

let World: World;
export function spawn<T>(operation: Operation): Context<T> {
  return World.spawn<T>(operation);
}

beforeEach(() => {
  World = run(undefined) as World<unknown>;
});

afterEach(() => {
  World.halt();
});
