import { ProjectOptions } from '@bigtest/project';
import { Client } from '@bigtest/server';
import * as query from './query';

export function* runTest(config: ProjectOptions) {
  let client: Client = yield Client.create(`ws://localhost:${config.port}`);

  let { run: testRunId } = yield client.query(query.run());

  console.log('Starting test run:', testRunId);

  let subscription = yield client.liveQuery(query.testRunResults(testRunId));

  while(true) {
    let { testRun } = yield subscription.receive();
    if(testRun.status === 'ok') {
      console.log('SUCCESS');
      break;
    }
    if(testRun.status === 'failed') {
      console.log('FAILED');
      break;
    }
  }
}

