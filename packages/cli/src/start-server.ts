import chalk from 'chalk';
import { sleep, spawn, MainError, Resource } from 'effection';
import { ProjectOptions } from '@bigtest/project';
import { createOrchestratorAtom, createOrchestrator } from '@bigtest/server';
import { ensureConfiguration } from './ensure-configuration';

interface Options {
  timeout: number;
}

export function startServer(project: ProjectOptions, options: Options): Resource<void> {
  return {
    name: 'server',
    *init(_, local) {
      ensureConfiguration(project);

      let atom = createOrchestratorAtom();
      yield spawn(createOrchestrator({ atom, project }));

      yield local.spawn(function*() {
        yield sleep(options.timeout);
        throw new MainError({ exitCode: 3, message: chalk.red(`ERROR: Timed out waiting for server to start after ${options.timeout}ms`) });
      });

      yield atom.slice('status').match({ type: 'ready' }).expect();
    }
  }
}
