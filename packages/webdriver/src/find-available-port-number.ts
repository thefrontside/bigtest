import { createServer, AddressInfo } from 'net';
import { Operation } from 'effection';
import { once, throwOnErrorEvent } from '@effection/events';

/**
 * Find a TCP port from the local operating system that is available
 * to connect to.
 *
 * Note that there is a potential for a race condition if another
 * operation (or process on the same machine) binds to the returned
 * port number before you can.
 */
export function* findAvailablePortNumber(): Operation<number> {
  let server = createServer();
  yield throwOnErrorEvent(server);

  server.listen();

  try {
    yield once(server, 'listening');

    let address = server.address() as AddressInfo;
    return address.port;
  } finally {
    server.close();
  }
}
