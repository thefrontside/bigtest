import { main as effectionMain, Context, Operation } from 'effection';

export function main(operation: Operation): Context {
  return effectionMain(({ context: mainContext, spawn }) => {

    spawn(function* main() {
      let interrupt = () => { mainContext.halt(); };
      try {
        process.on('SIGINT', interrupt);
        yield operation;
        mainContext.halt();
      } catch(e) {
        console.error(e);
        process.exit(-1);
      } finally {
        process.off('SIGINT', interrupt);
      }
    });
  });
}
