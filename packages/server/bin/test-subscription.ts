import { main } from '@effection/node';
import { Client } from '../src/client';

main(function* main() {
  let client: Client = yield Client.create('ws://localhost:24002');

  let subscription = yield client.subscription(`
    subscription {
      run {
        type
        status
        agentId
        testRunId
        path
        error {
          message
          fileName
          lineNumber
          columnNumber
          stack
        }
        timeout
      }
    }
  `);

  while (true) {
    let data = yield subscription.receive();
    if (data.done) {
      console.log('==== done ==== ');
      break;
    } else {
      console.log('==== new subscription result ==== ');
      console.log(JSON.stringify(data, null, 2));
    }
  }
});
