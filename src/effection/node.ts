import { main as effectionMain, Context, Operation } from 'effection';

export function main(operation: Operation): Context {
  return effectionMain(({ context }) => {
    let mainContext = context as any; // eslint-disable-line @typescript-eslint/no-explicit-any

    mainContext.spawn(function*() {
      try {
        yield operation;
      } catch(e) {
        console.error(e);
        process.exit(-1);
      }
    });

    let interrupt = () => { mainContext.halt()};

    process.on('SIGINT', interrupt);

    mainContext.ensure(() => {
      process.off('SIGINT', interrupt);
    });
  });
}
