#!/usr/bin/env node

import { todomvc } from './index';
import { main } from '@effection/node';

main(function* start() {
  let server = yield todomvc(port());

  console.info(`serving TodoMVC application`);
  console.info(`--> http://localhost:${server.port}`);

  yield server.join();
});

function port(): number | undefined {
  let [,, second ] = process.argv;
  if (second) {
    return parseInt(second);
  } else {
    return 25001;
  }
}
