import * as WebSocket from 'ws';
import { Operation } from 'effection';

import { resumeOnCb } from './util';

export function sendData(socket: WebSocket, data: string): Operation {
  return resumeOnCb(cb => socket.send(data, cb));
}