import { Subscribable } from '@effection/subscription';
import { Operation } from 'effection';

export interface Slice<S> extends Subscribable<S,undefined> {
  get(): S;
  set(value: S): void;
  update(fn: (state: S) => S): void;
  slice(): Sliceable<S>;
  once(predicate: (state: S) => boolean): Operation<S>;
  remove(): void;
  over(fn: (value: S) => S): void;
}
export type Atom<S> = Omit<Slice<S>, 'remove' | 'over'> & {
  reset(initializer?: (initial: S, curr: S) => S): void;
  setMaxListeners(value: number): void;
}

export type Sliceable<A> = {
  /* 
  * Brute foce overload to allow strong typing of the string path syntax
  * for every level deep we want to go in the slice there will need to be an overload 
  * with an argument for each of the string paths
  * 
  * e.g. atom.slice()('agents', agentId);  // 2 levels deep
  * 
  * There must be a matching overload
  * 
  * slice<Key1 extends keyof A, Key2 extends keyof A[Key1]>(key1: Key1, key2: Key2): Slice<A[Key1][Key2], A>;
  * 
  * key1 is 'agents' and key2 is agentId.
  * 
  * key1 is constrained to be a key of the atom `agents` which is atom.agents or could be
  * atom.manifest or atom.testRuns of Atom<OrchestratorState>
  * 
  * key2 is constrained to be a key of the return type A[Key1] which is the agents object and in this
  * example whatever the agentId variable is
  * 
  * The return type of the function is Slice<A[Key1][Key2], A>; or Slice<AgentState>
  * in this example
  */
 <
  Key extends keyof A
 >(
    key: Key
 ):
  Slice<A[Key]>;
 <
  Key1 extends keyof A,
  Key2 extends keyof A[Key1]
 >(
    key1: Key1, key2: Key2
  ):
  Slice<A[Key1][Key2]>;
 <
  Key1 extends keyof A,
  Key2 extends keyof A[Key1],
  Key3 extends keyof A[Key1][Key2]
 >(
    key1: Key1, key2: Key2, key3: Key3
  ):
  Slice<A[Key1][Key2][Key3]>;
 <
  Key1 extends keyof A,
  Key2 extends keyof A[Key1],
  Key3 extends keyof A[Key1][Key2],
  Key4 extends keyof A[Key1][Key2][Key3]
 >(
    key1: Key1, key2: Key2, key3: Key3, key4: Key4
  ):
  Slice<A[Key1][Key2][Key3][Key4]>;
 <
  Key1 extends keyof A,
  Key2 extends keyof A[Key1], 
  Key3 extends keyof A[Key1][Key2],
  Key4 extends keyof A[Key1][Key2][Key3],
  Key5 extends keyof A[Key1][Key2][Key3][Key4]
 >(
   key1: Key1, key2: Key2, key3: Key3, key4: Key4, key5: Key5
  ):
  Slice<A[Key1][Key2][Key3][Key4][Key5]>;
 <
  Key1 extends keyof A,
  Key2 extends keyof A[Key1],
  Key3 extends keyof A[Key1][Key2],
  Key4 extends keyof A[Key1][Key2][Key3],
  Key5 extends keyof A[Key1][Key2][Key3][Key4],
  Key6 extends keyof A[Key1][Key2][Key3][Key4][Key5]
 >(
   key1: Key1, key2: Key2, key3: Key3, key4: Key4, key5: Key5, key: Key6
  ):
  Slice<A[Key1][Key2][Key3][Key4][Key5][Key6]>;
 <
  Key1 extends keyof A,
  Key2 extends keyof A[Key1],
  Key3 extends keyof A[Key1][Key2],
  Key4 extends keyof A[Key1][Key2][Key3],
  Key5 extends keyof A[Key1][Key2][Key3][Key4],
  Key6 extends keyof A[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof A[Key1][Key2][Key3][Key4][Key5][Key6]
 >(key1: Key1, key2: Key2, key3: Key3, key4: Key4, key5: Key5, key: Key6, key7: Key7):
  Slice<A[Key1][Key2][Key3][Key4][Key5][Key6][Key7]>;
 <
  Key1 extends keyof A,
  Key2 extends keyof A[Key1],
  Key3 extends keyof A[Key1][Key2],
  Key4 extends keyof A[Key1][Key2][Key3],
  Key5 extends keyof A[Key1][Key2][Key3][Key4],
  Key6 extends keyof A[Key1][Key2][Key3][Key4][Key5],
  Key7 extends keyof A[Key1][Key2][Key3][Key4][Key5][Key6],
  Key8 extends keyof A[Key1][Key2][Key3][Key4][Key5][Key6][Key7]
 >(
   key1: Key1, key2: Key2, key3: Key3, key4: Key4, key5: Key5, key: Key6, key7: Key7, key8: Key8
  ):
  Slice<A[Key1][Key2][Key3][Key4][Key5][Key6][Key7][Key8]>;
}