import { main, Context, Operation } from 'effection';
import { describe, it } from 'mocha';
import * as expect from 'expect'

import { $console } from '../src/console';
import { CLI } from '../src/cli';

describe("@bigtest/cli", () => {
  let stdout = '';
  let World: Context;
  async function spawn<T>(operation: Operation): Promise<T> {
    return World["spawn"](operation);
  }

  beforeEach(async () => {
    World = main(undefined);
    await spawn($console.use({
      log: message => ({ resume }) => {
        stdout += message;
        stdout += "\n";
        resume();
      }
    }));
  });

  afterEach(() => {
    World.halt();
  });

  describe('invoking a command', () => {
    beforeEach(async () => {
      await spawn(CLI(['server']));
    });
    it('prints the output', () => {
      expect(stdout).toMatch('BIGTEST SERVER SHOULD RUN HERE');
    });
  });

})
