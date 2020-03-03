import { main, Context, Operation } from 'effection';

class World {
  static current: World;

  context: Context = main(undefined);

  spawn<T>(operation: Operation): Context & PromiseLike<T>{
    return this.context['spawn'](operation);
  }

  halt() {
    this.context.halt();
  }
}

export function spawn<T>(operation: Operation): Context & PromiseLike<T> {
  return World.current.spawn(operation);
}

beforeEach(() => {
  World.current = new World();
});

afterEach(() => {
  World.current.halt();
})
