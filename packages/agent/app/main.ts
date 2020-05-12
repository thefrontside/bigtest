import 'regenerator-runtime/runtime';
import { main } from 'effection';

import { queryParams } from './query-params';
import { createAgent } from './agent';

main(createAgent(queryParams))
  .catch(error => console.error(error));
