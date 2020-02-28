import { main, Operation, Context } from 'effection';
import { describe, it } from 'mocha';
import * as expect from 'expect'
import fetch, { Response } from 'node-fetch';
import { TodoMVC } from '../dist/index';

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
    let server: TodoMVC;
    beforeEach(async () => {
      server = await spawn(TodoMVC.react());
    });

    it('has a harness url where it will serve the harness script', () => {
      expect(server.port).toBeDefined();
    });


    describe('requesting the Todo MVC app', () => {
      let response: Response;

      beforeEach(async () => {
        response = await fetch(server.url);
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
