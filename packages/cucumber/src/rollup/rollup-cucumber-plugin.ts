import { PluginImpl, TransformResult, Plugin } from 'rollup';
import { CucumberOptions } from './options';
import { createFilter } from './filter';
import { GherkinParser } from '../gherkin-parser';
import { dataToEsm } from '@rollup/pluginutils';
import globby from 'globby';

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

    async buildStart({ input }) {
      // if the rollup.config has an input specified then bail
      if (input.length > 0) {
        return;
      }

      // if not, create an entry point for each feature file
      let featureFilePaths = await globby(options.include as string, {
        cwd: options.cwd,
        onlyFiles: true,
        absolute: true,
      });

      for (let featureFilePath of featureFilePaths) {
        this.emitFile({
          type: 'chunk',
          id: featureFilePath,
        });
      }
    },

    async transform(code, id) {
      if (!filter(id)) {
        return;
      }

      let parser = new GherkinParser({ code, uri: id, rootDir: options.cwd });

      let result = await parser.parse();

      let esm = dataToEsm(result, { namedExports: false });

      // TODO: add sourcemap support
      let transformResult: TransformResult = { code: esm };

      return transformResult;
    },
  };

  return plugin;
};

export default cucumberRollupPlugin;
