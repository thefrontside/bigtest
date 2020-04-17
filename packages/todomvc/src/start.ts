#!/usr/bin/env node

import { todomvc } from './index';
import { main } from '@effection/node';

main(function* start() {
  let port = findPort();
  let app = todomvc();

  yield app.listen(port);

  console.info(`serving TodoMVC application`);
  console.info(`--> http://localhost:${port}`);

  yield app.join();
});

function findPort(): number | undefined {
  let [,, second ] = process.argv;
  if (second) {
    return parseInt(second);
  } else {
    return 25001;
  }
}
