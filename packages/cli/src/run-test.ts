import * as chalk from 'chalk';
import { Operation } from 'effection';
import { ProjectOptions } from '@bigtest/project';
import { Client } from '@bigtest/client';
import { MainError } from '@effection/node';
import * as query from './query';
import { Formatter, FormatterConstructor } from './format-helpers';
import { reportCoverage } from './report-coverage';

import checks from './formatters/checks';
import lines from './formatters/lines';

interface Options {
  formatterName: string;
  files: string[];
  showFullStack: boolean;
  showLog: boolean;
  coverage: boolean;
}

const BUILTIN_FORMATTERS: Record<string, Formatter | FormatterConstructor> = { checks, lines };

function initFormatter(input: Formatter | FormatterConstructor): Formatter {
  if(typeof(input) === 'function') {
    return input();
  } else {
    return input;
  }
}

function *resolveFormatter(name: string): Operation<Formatter> {
  let builtin = BUILTIN_FORMATTERS[name];
  if(builtin) {
    return initFormatter(builtin);
  } else {
    try {
      let imported: Formatter | FormatterConstructor = yield import(name);
      return initFormatter(imported);
    } catch {
      throw new MainError({ exitCode: 1, message: chalk.red(`ERROR: Formatter with module name ${JSON.stringify(name)} not found.`) });
    }
  }
}

export function* runTest(config: ProjectOptions, options: Options): Operation<void> {
  let formatter = yield resolveFormatter(options.formatterName);
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
    files: options.files,
    showDependenciesStackTrace: options.showFullStack,
    showInternalStackTrace: options.showFullStack,
    showStackTraceCode: options.showFullStack,
    showLog: options.showLog,
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

  let treeQuery: query.TestResults = yield client.query(query.test(), {
    testRunId,
    showDependenciesStackTrace: options.showFullStack,
    showInternalStackTrace: options.showFullStack,
    showStackTraceCode: options.showFullStack,
    showLog: options.showLog,
    coverage: options.coverage
  });


  formatter.footer(treeQuery);

  if (options.coverage) {
    yield reportCoverage(config, treeQuery);
  }

  if(treeQuery.testRun.status !== 'ok') {
    throw new MainError({ exitCode: 1 });
  }
}
