import { main } from 'effection';

import { getLaneConfigFromTestFrame } from './lane-config';
import { runLane } from './run-lane';

/**
 * Runs a single lane inside this current html document.
 * It's meant to be a one-shot operation
 */
main(runLane(getLaneConfigFromTestFrame()));
