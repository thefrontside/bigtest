import { createFilter } from "rollup-pluginutils";
import { PluginImpl } from 'rollup';
import { EslintValidator } from '../../validators/eslint-validator';

export type EslintValidatorOptions =  {
  testFiles: string[];
  throwOnErrors?: boolean;
  throwOnWarnings?: boolean;
}

const eslintValidator = new EslintValidator();

export const eslintPlugin: PluginImpl<EslintValidatorOptions> = (options) => {
  if(!options) {
    throw new Error('no options supplied to eslintPlugin');
  }
  
  let {
    testFiles,
    throwOnErrors = true,
    throwOnWarnings = false
  } = options

  let filter = createFilter(
    testFiles,
    /node_modules/
  );

  return {
    name: "@bigtest/eslint-validator",

    async transform(_, id) {
      if (!filter(id)) {
        return null;
      }

      let bundlerState = await eslintValidator.validate(id);

      if (bundlerState.type === 'VALID') {
        if (bundlerState.warnings.length === 0) {
          return null;
        }

        for(let warning of bundlerState.warnings) {
          if(throwOnWarnings) {
            this.error(warning);
          }
          
          this.warn(warning);
        }

        return null;
      }

      if (throwOnErrors === false) {
        return
      }

      if (bundlerState.type !== 'INVALID') {
        return null;
      }

      console.log(bundlerState.errors[0].displayMessage)

      this.error(bundlerState.errors[0]);
    },
  };
}