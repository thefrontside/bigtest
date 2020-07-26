import { PluginImpl, TransformResult, Plugin } from 'rollup';
import { CucumberOptions } from './options';
import { createFilter } from './filter';

export const cucumberRollupPlugin: PluginImpl<CucumberOptions> = pluginOptions => {
  let options: CucumberOptions = {
    ...{
      include: '**/*.feature',
      cwd: process.cwd(),
    },
    ...pluginOptions,
  };

  let filter = createFilter(options);

  let plugin: Plugin = {
    name: 'bigtest-cucumber',
    transform(code, id) {
      console.log('we are in');
      console.dir({ code, id }, { depth: 33 });

      if (!filter(id)) {
        return;
      }

      let transformResult: TransformResult = { code };

      return transformResult;
    },
  };

  return plugin;
};
