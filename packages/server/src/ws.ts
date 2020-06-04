import * as WebSocket from 'ws';
import * as util from 'util';
import { Operation } from 'effection';

export function *sendData(socket: WebSocket, data: string): Operation {
  if(socket.readyState === 1) {
    yield util.promisify(socket.send.bind(socket))(data);
  }
}
