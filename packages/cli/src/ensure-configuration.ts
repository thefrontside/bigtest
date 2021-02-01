import { ProjectOptions } from '@bigtest/project';
import fs from 'fs';

export const ensureConfiguration = (config: ProjectOptions): void => {
  if (typeof config.tsconfig !== 'undefined' && fs.existsSync(config.tsconfig) === false) {
    let errorMessage = `The \`tsconfig\` option of bigtest.json (\`${config.tsconfig}\`) is invalid.`;
    
    console.error(errorMessage);

    // is process.exit(1); sufficient from an effection standpoint or
    // or should I use
    // throw new Error(errorMessage);
    process.exit(1);
  }
}