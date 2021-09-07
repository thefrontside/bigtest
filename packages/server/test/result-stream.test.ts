import { Effection, Task } from '@effection/core';
import { describe, beforeEach, it } from '@effection/mocha';
import expect from 'expect';

import { Subscription } from 'effection';

import { createAtom, Slice } from '@effection/atom';

import { resultStream } from '../src/result-stream';
import { TestRunState } from '../src/orchestrator/state';
import { TestEvent } from '../src/schema/test-event';
import chalk from 'chalk';

function taskToString(task: Task): string {
      let formattedLabels = Object.entries(task.labels).filter(([key]) => key !== 'name' && key !== 'expand').map(([key, value]) => `${key}=${JSON.stringify(value)}`).join(' ');
      return [
        [task.labels.name || 'task', chalk.yellow(task.state), formattedLabels, `[${task.type} ${task.id}]`].filter(Boolean).join(' '),
        task.yieldingTo && taskToString(task.yieldingTo).split('\n').map(l => '┃ ' + l).join('\n').replace(/^┃ /, `┣ ${chalk.green('yield')} `),
        ...Array.from(task.children).map((c) => taskToString(c).split('\n').map(l => '┃ ' + l).join('\n').replace(/^┃/, '┣'),)
      ].filter(Boolean).join('\n');
}

describe('result stream', () => {
  let slice: Slice<TestRunState>;
  let subscription: Subscription<TestEvent, void>;

  beforeEach(function*(world) {
    slice = createAtom({
      testRunId: 'test-run-1',
      status: 'pending',
      agents: {
        "agent-1": {
          status: 'pending',
          agent: { agentId: 'agent-1' },
          result: {
            description: 'some test',
            status: 'pending',
            steps: [
              { description: 'step one', status: 'pending' },
              { description: 'step two', status: 'pending' }
            ],
            assertions: [
              { description: 'assertion one', status: 'pending' },
              { description: 'assertion two', status: 'pending' }
            ],
            children: [
              {
                description: 'another test',
                status: 'pending',
                steps: [
                  { description: 'a child step', status: 'pending' }
                ],
                assertions: [
                  { description: 'a child assertion', status: 'pending' }
                ],
                children: []
              }
            ]
          }
        }
      }
    } as TestRunState);

    subscription = resultStream('test-run-1', slice).subscribe(world);
  });

  describe('marking a test as ok', () => {
    beforeEach(function*() {
      slice.slice('agents', 'agent-1', 'result', 'status').set('ok');
    });

    it.only('generates a test event', function*() {
      let { value } = yield subscription.next();
      expect(value).toMatchObject({
        type: 'test:result',
        status: 'ok',
        agentId: 'agent-1',
        testRunId: 'test-run-1',
        path: ['some test'],
      });
      console.log("done!");

      setTimeout(() => {
        console.log(taskToString(Effection.root));
      }, 2000);
    });
  });
});
