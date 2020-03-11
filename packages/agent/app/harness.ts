import 'regenerator-runtime/runtime';
import { main } from 'effection';
import { createHarness } from './create-harness';

main(createHarness())
  .catch(error => console.error(error));
