import { main, Context, Operation, Controls } from 'effection';
import { describe, it } from 'mocha';
import * as expect from 'expect'
import * as process from 'process'
import * as capcon from 'capture-console'

import { CLI } from '../src/cli';

type World<T> = Context<T> & Controls<T>;

describe("@bigtest/cli", () => {
  let stdout: string;
  let World: World<unknown>;
  async function spawn<T>(operation: Operation): Promise<T> {
    return World.spawn(operation);
  }

  async function capture(operation: Operation): Promise<string> {
    let result = "";
    capcon.startCapture(process.stdout, (output: string) => result += output);
    await spawn(operation);
    capcon.stopIntercept(process.stdout);
    return result;
  }


  beforeEach(async () => {
    World = main(undefined) as World<unknown>;
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
