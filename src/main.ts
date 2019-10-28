import { Operation, Execution, Sequence, fork } from 'effection';
import * as express from 'express';
import { Express } from 'express';
import { Server } from 'http';
import { AddressInfo } from 'net';

// entry point for bigtestd
export function* main(): Sequence {
  console.log('BigTest server');
  // servers the raw application
  // TODO: fork(buildServer);

  // serves the application with our special controls injected.
  fork(proxyServer);

  // accept commands from the outside world (CLI, UI, etc...)
  fork(commandServer);

  // realtime socket communication with browsers
  fork(connectionServer);
}

function* proxyServer() {
  yield;
}

const app = express()
  .use(express.json())
  .post('/', (req, res) => {
    res.send(req.body);
  })

function* commandServer() {
  let listener: Server = yield listen(app);
  let address: AddressInfo = listener.address() as AddressInfo;

  console.log(`command server running on ${address.port}`);

  try {
    yield;
  } finally {
    console.log('shutting down command server');
    listener.close();
  }
}

function listen(app: Express): Operation {
  return (execution: Execution<Server>) => {
    let listener = app.listen(4000, (err: Error) => {
      if (err) {
        execution.throw(err);
      } else {
        execution.resume(listener);
      }
    });
  }
}


function* connectionServer() {
  yield ;
}
