import { createClient, Client } from '@bigtest/client';
import { main } from 'effection';

main(function* main() {
  let client: Client = yield createClient('ws://localhost:24002');

  let [ source ]  = process.argv.slice(2);

  let data = yield client.query(source);

  console.log(JSON.stringify(data, null, 2));
})
