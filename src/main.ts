import { Sequence, fork } from 'effection';
import { createServer, end, IncomingMessage, ServerResponse } from './http';
import { AddressInfo } from 'net';

// entry point for bigtestd
export function* main(): Sequence {
  console.log('BigTest Server');

  // accept commands from the outside world (CLI, UI, etc...)
  fork(createServer(4000, commandServer, server => {
    let address = server.address() as AddressInfo;
    console.log(`-> listening for commands on port ${address.port}`);
  }));


  // TODO: serves the application with our special controls injected.
  // fork(proxyServer);


  // TODO: realtime socket communication with browsers
  // fork(connectionServer);

  // TODO: serves the raw application
  // fork(buildServer);
}

function* commandServer(req: IncomingMessage, res: ServerResponse): Sequence {
  res.writeHead(200, {
    'X-Powered-By': 'effection'
  });
  yield end(res, "Your wish is my command\n");
}
