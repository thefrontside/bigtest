import { Context, Operation, run } from 'effection';

type World = Context & { spawn<T>(operation: Operation<T>): Promise<T> };

let currentWorld: World;

beforeEach(() => {
  currentWorld = run(undefined) as World;
});

afterEach(() => {
  currentWorld.halt();
});

export function spawn<T>(operation: Operation<T>): Promise<T> {
  return currentWorld.spawn(operation);
}
