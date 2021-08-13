import { describe, it, beforeEach, captureError } from '@effection/mocha';
import { createQueue, Queue, Resource, Subscription, spawn } from 'effection';
import { express, Express, Socket } from '@bigtest/effection-express';
import expect from 'expect';
import { run, Task } from 'effection';
import { createClient, Client, Message, Response, isQuery } from '../src';

function testServer(): Resource<Queue<Socket>> {
  return {
    *init() {
      let connections = createQueue<Socket>();

      let app: Express = yield express();

      app.ws('*', (socket) => function*() {
        connections.send(socket);
        yield;
      });

      yield app.listen(3300);

      return connections;
    }
  }
}

describe('@bigtest/client', () => {

  describe('connecting without a server present', () => {
    let error: Error;

    beforeEach(function*() {
      error = yield captureError(createClient('http://localhost:3300'));
    });

    it('throws a NoServerError', function*() {
      expect(error).toHaveProperty('name', 'NoServerError');
    });
  });

  describe('interacting with the server', () => {
    let client: Client;
    let connection: Socket;

    beforeEach(function*() {
      let server = yield testServer();
      client = yield createClient('http://localhost:3300');
      connection = yield server.expect();
    });

    describe('sending a query', () => {
      let message: Message | undefined;
      let queryTask: Task<Response>;

      beforeEach(function*() {
        let messageTask = yield spawn(connection.expect());
        queryTask = run(client.query('echo(message: "Hello World")'));
        message = yield messageTask;
      });

      it('is received on the server', function*() {
        expect(message).toBeDefined();
        expect(message?.query).toEqual('echo(message: "Hello World")');
      });

      describe('when the server responds', () => {
        let response: Response;
        beforeEach(function*() {
          yield connection.send({
            done: true,
            data: { echo: { message: "Hello World" }},
            responseId: message?.responseId
          });

          response = yield queryTask;
        });

        it('returns the data to the original query', function*() {
          expect(response).toBeDefined();
          expect(response).toEqual({echo: { message: "Hello World" }});
        });
      });

      describe('when the server responds with an error response', () => {
        beforeEach(function*() {
          yield connection.send({
            responseId: message?.responseId,
            errors: [
              { message: 'failed' }
            ]
          })
        });

        it('rejects the original response', function*() {
          expect(yield captureError(queryTask)).toHaveProperty('message', 'failed');
        });
      });
    });

    describe('creating a live query', () => {
      let querySubscription: Subscription<unknown>;
      let message: Message;

      beforeEach(function*() {
        querySubscription = yield client.liveQuery('echo(message: "Hello World")');
        message = yield connection.expect();
      });

      it('sends the live query message to the server', function*() {
        expect(message).toBeDefined();
        expect(message?.query).toEqual('echo(message: "Hello World")');
        expect(isQuery(message)).toEqual(true);
      });

      describe('sending a result', () => {
        let response: unknown;

        beforeEach(function*() {
          yield connection.send({
            responseId: message?.responseId,
            data: {echo: { message: "Hello World" }}
          })
          response = yield querySubscription.expect();
        });

        it('is delivered to the query mailbox', function*() {
          expect(response).toBeDefined();
          expect(response).toEqual({echo: { message: "Hello World" }});
        });
      });
    });

    describe('sending a mutation', () => {
      let message: Message;
      let mutationResponse: Task<Response>;

      beforeEach(function*() {
        mutationResponse = yield spawn(client.mutation('{ run }'));
        message = yield connection.expect();

        expect(message?.mutation).toEqual('{ run }');
      });

      describe('when the sever responds', () => {
        beforeEach(function*() {
          yield connection.send({
            responseId: message?.responseId,
            data: { run: 'TestRun:1' }
          })
        });

        it('returns the mutation to the client', function*() {
          yield expect(mutationResponse).resolves.toEqual({ run: 'TestRun:1' });
        });
      });
    });
  });
});
