import 'regenerator-runtime/runtime';
import { run } from 'effection';

import { queryParams } from './query-params';
import { createAgent } from './agent';

run(createAgent(queryParams))
  .catch(error => console.error(error));
