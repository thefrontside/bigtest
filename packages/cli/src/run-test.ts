import { Operation } from 'effection';
import { ProjectOptions } from '@bigtest/project';
import { performance } from '@bigtest/performance';
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
    showStackTraceCode: false,
    showLog: false,
  });

  formatter.header();

  let testRunId;

  while(true) {
    let next: IteratorResult<query.RunResult> = yield subscription.next();
    if (next.done) {
      break;
    } else {
      testRunId = next.value.event.testRunId;
      formatter.event(next.value.event);
    }
  }

  console.log('\n');

  let treeQuery: query.TestResults = yield client.query(query.test(), {
    testRunId,
    showDependenciesStackTrace: false,
    showInternalStackTrace: false,
    showStackTraceCode: true,
    showLog: false,
  });

  formatter.footer(treeQuery);

  if(treeQuery.testRun.status !== 'ok') {
    throw new MainError({ exitCode: 1 });
  }
}
