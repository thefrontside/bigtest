import { main, Context, Operation } from 'effection';
import { describe, it } from 'mocha';
import * as expect from 'expect'
import * as process from 'process'
import * as capcon from 'capture-console'

import { CLI } from '../src/cli';

describe("@bigtest/cli", () => {
  let stdout: string;
  let World: Context;
  async function spawn<T>(operation: Operation<T>): Promise<T> {
    return World["spawn"](operation);
  }

  async function capture(operation: Operation): Promise<string> {
    let result = "";
    capcon.startIntercept(process.stdout, (output) => result += output);
    await spawn(operation);
    capcon.stopIntercept(process.stdout);
    return result;
  }


  beforeEach(async () => {
    World = main(undefined);
  });

  afterEach(() => {
    World.halt();
  });

  describe('invoking a command', () => {
    beforeEach(async () => {
      stdout = await capture(CLI(['server']));
    });

    it('prints the output', () => {
      expect(stdout).toMatch('BIGTEST SERVER SHOULD RUN HERE');
    });
  });

})
