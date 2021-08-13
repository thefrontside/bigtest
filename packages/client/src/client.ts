import { w3cwebsocket } from 'websocket';
import { createStream, Operation, Stream, Resource, spawn } from 'effection';
import { on, once } from '@effection/events';

import { Variables, Response, isErrorResponse, isDataResponse, isDoneResponse } from './protocol';
import { NoServerError } from './errors';

let responseIds = 0;

type WebSocket = w3cwebsocket & EventTarget;

export interface Client {
  query<T>(source: string, variables?: Variables): Operation<T>;
  mutation<T>(source: string, variables?: Variables): Operation<T>;
  liveQuery<T>(source: string, variables?: Variables): Stream<T>;
  subscription<T, TReturn = unknown>(source: string, variables?: Variables): Stream<T, TReturn>;
}

interface ErrorEvent {
  type: 'error';
}

function isErrorEvent(error: { type?: 'error' }): error is ErrorEvent {
  return error.type === 'error';
}

export function createClient(url: string): Resource<Client> {
  return {
    *init() {
      let socket = new w3cwebsocket(url) as WebSocket;

      yield function*() {
        yield spawn(function* detectStartupError() {
          let error = yield once(socket, 'error');

          if (isErrorEvent(error)) {
            throw new NoServerError(`Could not connect to server at ${url}`);
          } else {
            throw error;
          }
        });

        yield once(socket, 'open');
      }

      yield spawn(function*() {
        try {
          let { reason, code } = yield once(socket, 'close');
          if(code !== 1000) {
            throw new Error(`websocket server closed connection unexpectedly: [${code}] ${reason}`);
          }
        } finally {
          socket.close();
        }
      });

      function send<T = unknown, TReturn = undefined>(type: string, source: string, live = false, variables?: Variables) {
        return createStream<T, TReturn>((publish) => {
          return function*(task) {
            let messages =
              on<MessageEvent>(socket, "message")
                .map((event) => JSON.parse(event.data) as Response)
                .subscribe(task);

            let responseId = `${responseIds++}`; //we'd want a UUID to avoid hijacking?

            socket.send(JSON.stringify({ [type]: source, live, responseId, variables }));

            while (true) {
              let next: IteratorResult<Response> = yield messages.next();

              if (!next.done && next.value.responseId === responseId) {
                let response = next.value;
                if (isErrorResponse(response)) {
                  let messages = response.errors.map(error => error.message);
                  throw new Error(messages.join("\n"));;
                }
                if (isDataResponse(response)) {
                  publish(response.data as T)
                }
                if (isDoneResponse(response)) {
                  return response.data as TReturn;
                }
              }
            }
          };
        });
      }

      return {
        query<T>(source: string, variables?: Variables): Operation<T> {
          return send<T>("query", source, false, variables).expect();
        },

        mutation<T>(source: string, variables?: Variables): Operation<T> {
          return send<T>("mutation", source, false, variables).expect();
        },

        liveQuery<T>(source: string, variables?: Variables): Stream<T> {
          return send<T>("query", source, true, variables);
        },

        subscription<T, TReturn = unknown>(source: string, variables?: Variables): Stream<T, TReturn> {
          return send<T, TReturn>("subscription", source, false, variables);
        },
      }
    }
  }
}
