import { Operation } from 'effection';
import { ProjectOptions } from '@bigtest/project';
import { ResultStatus } from '@bigtest/suite';
import { Client } from '@bigtest/server';
import * as query from './query';
import { performance } from 'perf_hooks';

function formatFooter(label: string, counts: { ok: number, failed: number, disregarded: number }): string {
  return [
    `${label}:`.padEnd(14),
    `${counts.ok.toFixed(0)} ok`.padEnd(8),
    `${counts.failed.toFixed(0)} failed`.padEnd(12),
    `${counts.disregarded.toFixed(0)} disregarded`
  ].join(' ');
}

function icon(event: query.RunResultEvent) {
  if(event.type.match(/^:running$/)) {
    return "↻";
  } else if(event.status === 'ok') {
    return "✓";
  } else if(event.status === 'failed') {
    return "⨯";
  } else if(event.status === 'disregarded') {
    return "⋯";
  }
}

function filterStack(text: string): string {
  return text.split('\n').filter((l) => !l.match(/__bigtest/)).join('\n');
}

function prefixLines(text: string, prefix: string) {
  return text
    .split('\n')
    .map((l) => prefix + l)
    .join('\n')
}

function formatEvent(event: query.RunResultEvent) {
  let result = `${icon(event)} [${event.type.split(':')[0]}]`.padEnd(14);
  if(event.path) {
    result += ' ' + event.path.slice(1).join(' -> ');
  }
  if(event.error) {
    result += '\n' + prefixLines(event.error.stack ? filterStack(event.error.stack) : `Error: ${event.error.message}`, '|   ')
  }
  return result;
}

export function* runTest(config: ProjectOptions): Operation<ResultStatus> {
  let client: Client = yield Client.create(`ws://localhost:${config.port}`);

  let subscription = yield client.subscription(query.run());
  let stepCounts = { ok: 0, failed: 0, disregarded: 0 };
  let assertionCounts = { ok: 0, failed: 0, disregarded: 0 };
  let testRunStatus: ResultStatus | undefined;

  let startTime = performance.now();

  while(true) {
    let result: query.RunResult = yield subscription.receive();
    if(query.isDoneResult(result)) {
      break;
    } else if(result.event) {
      let status = result.event.status;
      if(result.event.type === 'testRun:result') {
        testRunStatus = result.event.status;
      }
      if(result.event.type === 'step:result') {
        console.log(formatEvent(result.event));
        if(status && status !== 'pending' && status !== 'running') {
          stepCounts[status] += 1;
        }
      }
      if(result.event.type === 'assertion:result') {
        console.log(formatEvent(result.event))
        if(status && status !== 'pending' && status !== 'running') {
          assertionCounts[status] += 1;
        }
      }
    }
  }

  let endTime = performance.now();
  console.log('');
  console.log(testRunStatus === 'ok' ? '✓ SUCCESS' : '⨯ FAILURE', `finished in ${((endTime - startTime)/1000).toFixed(2)}s`);
  console.log(formatFooter('Steps', stepCounts));
  console.log(formatFooter('Assertions', assertionCounts));

  return testRunStatus || 'failed';
}

