import { Operation, Controls } from 'effection';

// run the given operation in the parent context, without blocking it
export function suspend(operation: Operation): Operation {
  return ({ context, resume }) => {
    let targetContext = context.parent.parent as unknown as Controls;
    resume(targetContext.spawn(operation));
  }
}
