import { Operation, Controller, Context } from 'effection';

export const $console = {
  log(message: string): Operation {
    return ctl => findHandler(ctl.context).log(message)(ctl);
  },

  use(handler: ConsoleHandler): Operation {
    return ({ resume, context }) => {
      context.parent[key] = handler;
      resume();
    }
  },

  useStdio(): Operation {
    return this.use({
      log(message: string): Operation {
        return ({ resume, fail }) => {
          try {
            console.log(message);
            resume();
          } catch (error) {
            fail(error);
          }
        }
      }
    });
  }
}

interface ConsoleHandler {
  log(message: string): Controller;
}

const key = Symbol('$console');

function findHandler(context: Context): ConsoleHandler {
  for (let current: Context = context; !!current; current = current.parent) {
    let handler: ConsoleHandler = current[key];
    if (handler) {
      return handler;
    }
  }
  throw new Error('No registered handler for `$console`');
}
