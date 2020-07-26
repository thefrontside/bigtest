import { createFilter as createRollupFilter } from '@rollup/pluginutils';
import { CucumberOptions } from './options';

export const createFilter = ({ include, exclude, cwd }: CucumberOptions) => {
  return createRollupFilter(include, exclude, { resolve: cwd });
};
