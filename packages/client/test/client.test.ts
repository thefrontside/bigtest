import { describe, it } from 'mocha';
import * as expect from 'expect';
import { ChainableSubscription } from '@effection/subscription';
import { TestConnection, TestServer, run } from './helpers';
import { Client, Message, Response, isQuery } from '../src';

describe('@bigtest/client', () => {

  describe('connecting without a server present', () => {
    let error: Error;

    beforeEach(async () => {
      try {
        await run(Client.create('http://localhost:3300'));
      } catch (e) {
        error = e;
      }
    });

    it('throws a NoServerError', () => {
      expect(error).toHaveProperty('name', 'NoServerError');
    });

  });

  describe('interacting with the server', () => {
    let server: TestServer;
    let client: Client;
    let connection: TestConnection;

    beforeEach(async () => {
      server = await TestServer.start(3300);
      let nextConnection = server.connection();
      client = await run(Client.create('http://localhost:3300'));
      connection = await nextConnection;
    });

    describe('sending a query', () => {
      let message: Message | undefined;
      let queryResponse: Promise<Response>;
      beforeEach(async () => {
        queryResponse = run(client.query('echo(message: "Hello World")'));
        message = await connection.receive();
      });

      it('is received on the server', () => {
        expect(message).toBeDefined();
        expect(message?.query).toEqual('echo(message: "Hello World")');
      });

      describe('when the server responds', () => {
        let response: {};
        beforeEach(async () => {
          await connection.send({
            done: true,
            data: { echo: { message: "Hello World" }},
            responseId: message?.responseId
          });

          response = await queryResponse;
        });

        it('returns the data to the original query', () => {
          expect(response).toBeDefined();
          expect(response).toEqual({echo: { message: "Hello World" }});
        });
      });

      describe('when the server responds with an error response', () => {
        beforeEach(async() => {
          await connection.send({
            responseId: message?.responseId,
            errors: [
              { message: 'failed' }
            ]
          })
        });

        it('rejects the original response', async () => {
          await expect(queryResponse).rejects.toEqual(new Error('failed'));
        });
      });
    });

    describe('creating a live query', () => {
      let subscription: ChainableSubscription<unknown, unknown>;
      let message: Message;
      beforeEach(async () => {
        subscription = await run(client.liveQuery('echo(message: "Hello World")'));
        message = await connection.receive() as Message;
      });

      it('sends the live query message to the server', () => {
        expect(message).toBeDefined();
        expect(message?.query).toEqual('echo(message: "Hello World")');
        expect(isQuery(message)).toEqual(true);
      });

      describe('sending a result', () => {
        let response: unknown;

        beforeEach(async () => {
          await connection.send({
            responseId: message?.responseId,
            data: {echo: { message: "Hello World" }}
          })
          response = await run(subscription.expect());
        });

        it('is delivered to the query mailbox', () => {
          expect(response).toBeDefined();
          expect(response).toEqual({echo: { message: "Hello World" }});
        });
      });
    });

    describe('sending a mutation', () => {
      let message: Message;
      let mutationResponse: Promise<Response>;

      beforeEach(async () => {
        mutationResponse = run(client.mutation('{ run }'));
        message = await connection.receive() as Message;

        expect(message?.mutation).toEqual('{ run }');
      });

      describe('when the sever responds', () => {
        beforeEach(async () => {
          await connection.send({
            responseId: message?.responseId,
            data: { run: 'TestRun:1' }
          })
        });

        it('returns the mutation to the client', async () => {
          await expect(mutationResponse).resolves.toEqual({ run: 'TestRun:1' });
        });
      });
    });

  })

});
