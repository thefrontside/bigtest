export { createOrchestrator } from './orchestrator';
export { Atom } from './orchestrator/atom';
export { Client } from './client';

import { Operation } from 'effection';
import { createOrchestrator } from './orchestrator';
import { Atom } from './orchestrator/atom';
import { ProjectOptions } from '@bigtest/project';

export function* createServer(project: ProjectOptions): Operation {
  let atom = new Atom();
  yield createOrchestrator({
    atom: atom,
    project: project,
  });
}
