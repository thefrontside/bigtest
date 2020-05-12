export { createOrchestrator } from './orchestrator';
export { createOrchestratorAtom } from './orchestrator/atom';
export { Client } from './client';

import { Operation } from 'effection';
import { createOrchestrator } from './orchestrator';
import { createOrchestratorAtom } from './orchestrator/atom';
import { ProjectOptions } from '@bigtest/project';

export function* createServer(project: ProjectOptions): Operation {
  let atom = createOrchestratorAtom();
  yield createOrchestrator({ atom, project });
}
