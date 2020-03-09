import { fork, Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';
import { Atom } from './orchestrator/atom';
import { TestRunState } from './orchestrator/state';

interface CommandProcessorOptions {
  atom: Atom;
  inbox: Mailbox;
  delegate: Mailbox;
  proxyPort: number;
  manifestPort: number;
};

function* run(id: string, options: CommandProcessorOptions): Operation {
  console.debug('[command processor] running test', id);

  let testRunSlice = options.atom.slice<TestRunState>(['testRuns', id]);
  let [agent] = Object.values(options.atom.get().agents);
  let manifest = options.atom.get().manifest;

  let appUrl = `http://localhost:${options.proxyPort}`;
  let manifestUrl = `http://localhost:${options.manifestPort}/${manifest.fileName}`;

  if(agent) {
    // todo: we should perform filtering of the manifest here
    testRunSlice.set({ status: 'pending', tree: manifest, agent });

    console.debug(`[command processor] starting test run ${id} on agent ${agent.identifier}`);
    options.delegate.send({ type: 'run', status: 'pending', agentId: agent.identifier, appUrl, manifestUrl, testRunId: id, tree: manifest });
  }
}

export function* createCommandProcessor(options: CommandProcessorOptions): Operation {
  while(true) {
    let message = yield options.inbox.receive();

    console.debug('[command processor] received message', message);

    if(message.type === 'run') {
      yield fork(run(message.id, options));
    }
  }
}
