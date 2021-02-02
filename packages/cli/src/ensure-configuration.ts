import { ProjectOptions } from '@bigtest/project';
import { MainError } from '@effection/node';
import fs from 'fs';

export const ensureConfiguration = (config: ProjectOptions): void => {
  if (typeof config.tsconfig !== 'undefined' && fs.existsSync(config.tsconfig) === false) {
    let message = `The \`tsconfig\` option of bigtest.json (\`${config.tsconfig}\`) is invalid.`;
    
    throw new MainError({ exitCode: 1, message });
  }
}