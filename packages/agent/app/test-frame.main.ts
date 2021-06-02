import 'regenerator-runtime/runtime';
import { run } from 'effection';

import { getLaneConfigFromTestFrame } from './lane-config';
import { runLane } from './run-lane';

/**
 * Runs a single lane inside this current html document.
 * It's meant to be a one-shot operation
 */
run(runLane(getLaneConfigFromTestFrame()))
  .catch((error: Error) => console.error(error))
