import { Operation } from 'effection';
import { ProjectOptions } from '@bigtest/project';
import { performance } from '@bigtest/performance';
import { ResultStatus } from '@bigtest/suite';
import { Client } from '@bigtest/client';
import { MainError } from '@effection/node';
import * as query from './query';
import { StreamingFormatter } from './format-helpers';

export function* runTest(config: ProjectOptions, formatter: StreamingFormatter): Operation<void> {

  let uri = `ws://localhost:${config.port}`;

  let client: Client = yield function*() {
    try {
      return yield Client.create(uri);
    } catch (e) {
      if (e.name === 'NoServerError') {
        throw new MainError({
          exitCode: 1,
          message: `Could not connect to BigTest server on ${uri}. Run "bigtest server" to start the server.`
        });
      }
      throw e;
    }
  };

  let subscription = yield client.subscription(query.run(), {
    showDependenciesStackTrace: false,
    showInternalStackTrace: false,
    showStackTraceCode: false
  });
  let stepCounts = { ok: 0, failed: 0, disregarded: 0 };
  let assertionCounts = { ok: 0, failed: 0, disregarded: 0 };
  let testRunStatus: ResultStatus | undefined;

  formatter.header();

  let startTime = performance.now();

  while(true) {
    let next: IteratorResult<query.RunResult> = yield subscription.next();
    if (next.done) {
      break;
    } else if (!query.isDoneResult(next.value)) {
      let result = next.value;
      let status = result.event.status;
      if(result.event.type === 'testRun:result') {
        testRunStatus = result.event.status;
      }
      if(result.event.type === 'step:result' && status && status !== 'pending' && status !== 'running') {
        stepCounts[status] += 1;
      }
      if(result.event.type === 'assertion:result' && status && status !== 'pending' && status !== 'running') {
        assertionCounts[status] += 1;
      }
      formatter.event(result.event, config);
    }
  }

  let endTime = performance.now();

  formatter.footer({
    status: testRunStatus || 'failed',
    duration: endTime - startTime,
    stepCounts,
    assertionCounts,
  });

  if(testRunStatus !== 'ok') {
    throw new MainError({ exitCode: 1 });
  }
}
