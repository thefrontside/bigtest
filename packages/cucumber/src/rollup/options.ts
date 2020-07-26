import { FilterPattern } from '@rollup/pluginutils';

export type CucumberOptions = {
  cwd: string;
  include?: FilterPattern;
  exclude?: FilterPattern;
};
