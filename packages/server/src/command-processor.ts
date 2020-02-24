import { fork, Operation } from 'effection';
import { Mailbox } from '@effection/events';
import { Atom } from './orchestrator/atom';
import { dissoc, lensPath, compose } from 'ramda';

interface CommandProcessorOptions {
  atom: Atom;
  inbox: Mailbox;
  delegate: Mailbox;
};

function* run(id: string, options: CommandProcessorOptions): Operation {
  console.debug('[command processor] running test', id);

  let lens = lensPath(['testRuns', id]);
  let [agent] = Object.values(options.atom.get().agents);
  let manifest = options.atom.get().manifest;

  if(agent) {
    // todo: we should perform filtering of the manifest here
    options.atom.set(lens, { manifest, agent });

    console.debug(`[command processor] starting test run ${id} on agent ${agent.identifier}`);
    options.delegate.send({ type: 'run', manifestFileName: manifest.fileName, agentId: agent.identifier, testRunId: id });
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
