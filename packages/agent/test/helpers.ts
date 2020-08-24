import { Context, Operation, main as effectionMain } from 'effection';

type World = Context & { spawn<T>(operation: Operation<T>): Promise<T> };

let currentWorld: World;

beforeEach(() => {
  currentWorld = effectionMain(undefined) as World;
});

afterEach(() => {
  currentWorld.halt();
});

export function run<T>(operation: Operation<T>): Promise<T> {
  return currentWorld.spawn(operation);
}
