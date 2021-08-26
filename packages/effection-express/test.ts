import { express, Express } from './src/index';
import { main } from 'effection';

type Message = { message: string };

main(function*() {
  let app: Express = yield express();

  app.ws<Message>('*', (socket) => function*() {
    yield socket.forEach(({ message }) => socket.send({ message: message.toUpperCase() }));
  });

  console.log('starting');

  yield app.listen(39000);

  console.log('started');

  yield;
});
