import { Task, Operation, main } from 'effection';

type World = Task & { spawn<T>(operation: Operation<T>): Promise<T> };

let currentWorld: World;

beforeEach(() => {
  currentWorld = main(undefined) as World;
});

afterEach(() => {
  currentWorld.halt();
});

export function run<T>(operation: Operation<T>): Promise<T> {
  return currentWorld.spawn(operation);
}
