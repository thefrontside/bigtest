import { main } from '@bigtest/effection';
import { Client } from '../src/client';

main(function* main() {
  let client: Client = yield Client.create('ws://localhost:24002');

  let [ source ]  = process.argv.slice(2);

  let subscription = yield client.subscribe(source);

  while (true) {
    let data = yield subscription.receive();
    console.log('==== new subscription result ==== ');
    console.log(JSON.stringify(data, null, 2));
  }
});
