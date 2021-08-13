import { ProjectOptions } from '@bigtest/project';
import { MainError } from 'effection';
import fs from 'fs';

export function ensureConfiguration(config: ProjectOptions): void {
  if (typeof config.tsconfig !== 'undefined' && fs.existsSync(config.tsconfig) === false) {
    let message = `ERROR: The tsconfig file '${config.tsconfig}' does not exist.`;

    throw new MainError({ exitCode: 1, message });
  }
}
