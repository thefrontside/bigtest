import { main, Operation, Context, Controls } from 'effection';
import { describe, it } from 'mocha';
import expect from 'expect';
import fetch, { Response } from 'node-fetch';
import { todomvc } from '../dist/index';

type World<T> = Context<T> & Controls<T>;

describe("@bigtest/todomvc", () => {

  let World: World<unknown>;
  async function spawn<T>(operation: Operation): Promise<T> {
    return World.spawn(operation);
  }

  beforeEach(() => {
    World = main(undefined) as World<unknown>;
  });

  afterEach(() => {
    World.halt();
  });

  describe('starting a React based TodoMVC server', () => {
    beforeEach(async () => {
      await spawn(todomvc().listen(25000));
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
});
