import { Operation, Context } from 'effection';

export interface Spawner {
  spawn<T>(operation: Operation<T>): Context<T>;
}

export type SpawnContext = Context<unknown> & Spawner;
