import { PluginImpl, TransformResult, Plugin } from 'rollup';
import { CucumberOptions } from './options';
import { createFilter } from './filter';
import { GherkinParser } from '../gherkin-parser';

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

      console.log(result);

      let transformResult: TransformResult = { code };

      return transformResult;
    },
  };

  return plugin;
};

export default cucumberRollupPlugin;
