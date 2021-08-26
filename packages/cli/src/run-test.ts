import chalk from 'chalk';
import { Operation, MainError } from 'effection';
import { ProjectOptions } from '@bigtest/project';
import { createClient, Client } from '@bigtest/client';
import * as query from './query';
import { Printer } from './printer';
import { Formatter, FormatterConstructor } from './format-helpers';
import { reportCoverage } from './report-coverage';
import { RunArgs } from './cli';

import checks from './formatters/checks';
import lines from './formatters/lines';

const BUILTIN_FORMATTERS: Record<string, Formatter | FormatterConstructor> = { checks, lines };

function initFormatter(input: Formatter | FormatterConstructor): Formatter {
  if(typeof(input) === 'function') {
    let printer = new Printer(process.stdout);
    return input(printer);
  } else {
    return input;
  }
}

const resolveFormatter = (name: string): Operation<Formatter> => function*() {
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

export function* runTest(options: ProjectOptions, args: RunArgs): Operation<void> {
  let formatter: Formatter = yield resolveFormatter(args.formatter);
  let uri = `ws://localhost:${options.port}`;
  let client: Client;

  try {
    client = yield createClient(uri);
  } catch (e) {
    if (e.name === 'NoServerError') {
      throw new MainError({
        exitCode: 1,
        message: `Could not connect to BigTest server on ${uri}. Run "bigtest server" to start the server.`
      });
    }
    throw e;
  }

  formatter.header();

  let testRunId;

  yield client.subscription<query.RunResult>(query.run(), {
    files: args.files,
    showDependenciesStackTrace: args.showFullStack,
    showInternalStackTrace: args.showFullStack,
    showStackTraceCode: args.showFullStack,
    showLog: args.showLog,
  }).forEach(({ event }) => {
    formatter.event(event);
    testRunId = event.testRunId;
  });

  let treeQuery: query.TestResults = yield client.query(query.test(), {
    testRunId,
    showDependenciesStackTrace: args.showFullStack,
    showInternalStackTrace: args.showFullStack,
    showStackTraceCode: args.showFullStack,
    showLog: args.showLog,
    coverage: args.coverage,
  });

  formatter.footer(treeQuery);

  if (args.coverage) {
    yield reportCoverage(options, treeQuery);
  }

  if(treeQuery.testRun.status !== 'ok') {
    throw new MainError({ exitCode: 1 });
  }
}
