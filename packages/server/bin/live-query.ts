import { createClient, Client } from '@bigtest/client';
import { main } from 'effection';

main(function* main() {
  let client: Client = yield createClient('ws://localhost:24002');

  let [ source ]  = process.argv.slice(2);

  let subscription = yield client.liveQuery(source);

  while (true) {
    let { value: data } = yield subscription.next();
    console.log('==== new subscription result ==== ');
    console.log(JSON.stringify(data, null, 2));
  }
});
