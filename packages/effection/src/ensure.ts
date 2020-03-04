import { Operation, Controls } from 'effection';

// an operation which attaches a handler which runs when the current context
// finishes.
export function ensure(fn: () => void): Operation {
  return ({ resume, context }) => {
    let targetContext = context.parent as unknown as Controls;
    targetContext.ensure(fn);
    resume(null);
  }
}
