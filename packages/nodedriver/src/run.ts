import { fork, spawn, Operation } from 'effection';
import { on, once } from '@effection/events';
import { ChildProcess } from '@effection/node';
import { Subscribable, SymbolSubscribable, createSubscription, forEach } from '@effection/subscription';
import { Agent, TestEvent, Run } from '@bigtest/agent';
import { Test } from '@bigtest/suite';

import * as path from 'path';

const RunnerProcess = path.join(__dirname, 'lane-runner');

function* leafPaths(tree: Test, prefix: string[] = []): Generator<string[]> {
  let path = prefix.concat(tree.description);
  if(tree.children.length === 0) {
    yield path;
  } else {
    for(let child of tree.children) {
      yield* leafPaths(child, path);
    }
  }
}

export function * run(agent: Agent, command: Run) {
  let { manifestUrl, testRunId, tree } = command;
  for (let path of leafPaths(tree)) {

    yield fork(function*() {
      try {
        agent.send({ type: 'lane:begin', testRunId, path });
        let runner: Subscribable<any, void> = yield createLaneRunner(manifestUrl, path, testRunId);
        yield forEach(runner, function*(event) {
          agent.send(event);
        });
      } finally {
        agent.send({ type: 'lane:end', testRunId, path });
      }
    });
  }
}

function* createLaneRunner(manifestUrl: string, path: string[], testRunId: string): Operation<Subscribable<TestEvent,void>> {
  let subprocess: ChildProcess.ChildProcess = yield ChildProcess.fork(RunnerProcess, [], {
    stdio: 'inherit',
    execPath: process.env.NODE_ENV === 'test' ? 'ts-node' : undefined
  });

  let messages = () => Subscribable.from<object[], void>(on(subprocess, 'message'))
    .map(([message]) => message)

  yield messages().match({ ready: true }).first();


  Object.defineProperty(subprocess, SymbolSubscribable, {
    value: () => createSubscription<TestEvent, void>(function*(publish) {
      yield spawn(messages().forEach(function*(message) {
        publish({ ...message, testRunId } as TestEvent);
      }));
      yield once(subprocess, 'exit');
    })
  });

  subprocess.send({type: 'run', manifestUrl, path, testRunId });
  return subprocess as unknown as Subscribable<TestEvent, void>;
}
