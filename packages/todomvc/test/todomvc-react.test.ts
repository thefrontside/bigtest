import { main, Operation, Context } from 'effection';
import { describe, it } from 'mocha';
import * as expect from 'expect'
import fetch, { Response } from 'node-fetch';
import { todomvc } from '../dist/index';

describe("@bigtest/todomvc", () => {

  let World: Context;
  async function spawn<T>(operation: Operation): Promise<T> {
    return World["spawn"](operation);
  }

  beforeEach(() => {
    World = main(undefined);
  });

  afterEach(() => {
    World.halt();
  });

  describe('starting a React based TodoMVC server', () => {
    beforeEach(async () => {
      await spawn(todomvc(25000));
    });

    describe('requesting the Todo MVC app', () => {
      let response: Response;

      beforeEach(async () => {
        response = await fetch("http://localhost:25000");
      });

      it('responds successfully', () => {
        expect(response.statusText).toEqual('OK');
      });

      describe('the html', () => {
        let text: string;
        beforeEach(async () => {
          text = await response.text();
        });

        it('contains the TodoMVC app', () => {
          expect(text).toContain('<title>React TodoMVC Example</title>');
        });
      });
    });
  });
})
