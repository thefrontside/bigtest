export { createOrchestrator } from './orchestrator';
export { createOrchestratorAtom } from './orchestrator/atom';

import { Operation } from 'effection';
import { createOrchestrator } from './orchestrator';
import { createOrchestratorAtom } from './orchestrator/atom';
import { ProjectOptions } from '@bigtest/project';

export function* createServer(project: ProjectOptions): Operation {
  let atom = createOrchestratorAtom({ app: project.app });
  yield createOrchestrator({ atom, project });
}
