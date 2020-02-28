import { TodoMVC } from '@bigtest/todomvc';
import { main } from '@effection/node';

main(function* start() {
  let server: TodoMVC = yield TodoMVC.react(port());

  console.info(`serving TodoMVC application`);
  console.info(`--> http://localhost:${server.port}`);

  yield server.join();
});

function port(): number | undefined {
  let [,, second ] = process.argv;
  if (second) {
    return parseInt(second);
  } else {
    return undefined;
  }
}
