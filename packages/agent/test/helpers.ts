import { Context, Operation, run as effectionRun } from 'effection';

type World = Context & { spawn<T>(operation: Operation<T>): Promise<T> };

let currentWorld: World;

beforeEach(() => {
  currentWorld = effectionRun(undefined) as World;
});

afterEach(() => {
  currentWorld.halt();
});

export function run<T>(operation: Operation<T>): Promise<T> {
  return currentWorld.spawn(operation);
}
