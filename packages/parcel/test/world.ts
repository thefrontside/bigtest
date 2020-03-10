import { main, Context, Operation } from 'effection';

let World: Context;

export async function spawn<T>(operation: Operation): Promise<T> {
  return (World as any).spawn(operation);
}


beforeEach(() => {
  World = main(undefined);
});

afterEach(() => {
  World.halt();
});
