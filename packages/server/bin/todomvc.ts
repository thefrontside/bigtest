import { TodoMVC } from '@bigtest/todomvc';
import { main } from '@effection/node';

main(function* start() {
  let server: TodoMVC = yield TodoMVC.react(2400);

  console.info(`serving TodoMVC application`);
  console.info(`--> http://localhost:${server.port}`);

  yield server.join();
});
