import { main, Context, Operation } from 'effection';

let World: Context;

export async function spawn<T>(operation: Operation): Promise<T> {

  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (World as any).spawn(operation);
}


beforeEach(() => {
  World = main(undefined);
});

afterEach(() => {
  World.halt();
});
