import { main, Operation } from 'effection';
import { Client } from '../src/client';

const self: Operation = ({ resume, context: { parent }}) => resume(parent);

main(function* main() {
  let context = yield self;
  let interrupt = () => { context.halt()};
  process.on('SIGINT', interrupt);
  try {
    let client: Client = yield Client.create('ws://localhost:24002');

    let [ source ]  = process.argv.slice(2);

    let data = yield client.query(source);

    console.log(JSON.stringify(data, null, 2));
  } catch (e) {
    console.error(e);
  } finally {
    process.off('SIGINT', interrupt);
  }
})
