import { main, Operation } from 'effection';

interface World {
  halt(): void;
  spawn<T>(operation: Operation<T>): Promise<T>;
}

let world: World;

beforeEach(() => {
  world = main(undefined) as unknown as World;
});

afterEach(() => {
  world.halt();
});

export function run<T>(operation: Operation<T>): Promise<T> {
  return world.spawn(operation);
}
