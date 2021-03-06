import chalk from 'chalk';
import { Operation, spawn, timeout } from 'effection';
import { MainError } from '@effection/node';
import { readyResource } from '@bigtest/effection';
import { ProjectOptions } from '@bigtest/project';
import { createOrchestratorAtom, createOrchestrator } from '@bigtest/server';
import { ensureConfiguration } from './ensure-configuration';

interface Options {
  timeout: number;
}

// TODO: this is what the server package should be doing in the first place
// See: https://github.com/thefrontside/bigtest/issues/295
export function* startServer(project: ProjectOptions, options: Options): Operation<Record<string, unknown>> {
  return yield readyResource({}, function*(ready) {
    ensureConfiguration(project);

    let atom = createOrchestratorAtom();
    yield spawn(createOrchestrator({ atom, project }));

    yield function*() {
      yield spawn(function*(): Operation<void> {
        yield timeout(options.timeout);
        throw new MainError({ exitCode: 3, message: chalk.red(`ERROR: Timed out waiting for server to start after ${options.timeout}ms`) });
      });

      yield atom.slice('status', 'type').once(type => type === 'ready');
    }
    ready();
    yield;
  });
}
