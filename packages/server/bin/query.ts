import { main } from '@effection/node';
import { Client } from '../src/client';

main(function* main() {
  let client: Client = yield Client.create('ws://localhost:24002');

  let [ source ]  = process.argv.slice(2);

  let data = yield client.query(source);

  console.log(JSON.stringify(data, null, 2));
})
