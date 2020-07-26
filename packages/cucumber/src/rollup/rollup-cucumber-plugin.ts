import { PluginImpl, TransformResult, Plugin } from 'rollup';
import { CucumberOptions } from './options';
import { createFilter } from './filter';
import { GherkinParser } from '../gherkin-parser';
import { dataToEsm } from '@rollup/pluginutils';

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
    async transform(code, id) {
      if (!filter(id)) {
        return;
      }

      let parser = new GherkinParser({ code, uri: id, rootDir: options.cwd });

      let result = await parser.parse();

      let esm = dataToEsm(result, { namedExports: false });

      console.log(esm);

      let transformResult: TransformResult = { code: esm };

      return transformResult;
    },
  };

  return plugin;
};

export default cucumberRollupPlugin;
