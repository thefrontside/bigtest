import { main as effectionMain, Operation } from "effection";
import { EventEmitter } from "events";

export const self: Operation = ({ resume, context: { parent }}) => resume(parent);
export const parent: Operation = ({ resume, context: { parent }}) => resume(parent.parent);

export function main(operation: Operation) {
  return effectionMain(function*() {
    let mainContext = yield self;
    let interrupt = () => { mainContext.halt(); };
    try {
      process.on('SIGINT', interrupt);

      yield operation;

    } catch (error) {
      console.log(error);
      process.exit(-1);
    } finally {
      process.on('SIGINT', interrupt);
    }
  })
};

export function once(emitter: EventEmitter, event: string | symbol): Operation {
  return ({ resume, ensure }) => {
    let handle = (...args: unknown[]) => resume(args);
    emitter.on(event, handle);
    ensure(() => emitter.off(event, handle));
  }
}
