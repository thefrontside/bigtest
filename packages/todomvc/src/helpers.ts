import { main as effectionMain, Operation } from "effection";

export const self: Operation = ({ resume, context: { parent }}) => resume(parent);

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
