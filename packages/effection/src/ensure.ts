import { Operation } from 'effection';

// an operation which attaches a handler which runs when the current context
// finishes.
export function ensure(fn: () => void): Operation {
  return ({ resume, spawn }) => {
    resume(spawn(({ ensure }) => ensure(fn)));
  }
}
