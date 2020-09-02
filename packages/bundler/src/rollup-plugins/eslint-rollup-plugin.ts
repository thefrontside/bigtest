import * as path from "path";
import { createFilter } from "rollup-pluginutils";

import { BundleOptions } from '../types';
import { PluginImpl } from 'rollup';
import { EslintValidator } from '../validators/eslint/eslint-validator';

function normalizePath(id) {
  return path
    .relative(process.cwd(), id)
    .split(path.sep)
    .join("/");
}

export type EslintValidatorOptions = BundleOptions & {
  eslintValidator: EslintValidator;
  throwOnErrors: boolean;
  throwOnWarnings: boolean;
}

export const eslint: PluginImpl<EslintValidatorOptions> = ({ 
  eslintValidator,
  testFiles,
  throwOnErrors = true, 
  throwOnWarnings = false
}) => {


  let filter = createFilter(
    testFiles,
    /node_modules/
  );

  return {
    name: "eslint-validator",

    transform(code, id) {
      let file = normalizePath(id);
      if (!filter(id)) {
        return null;
      }

      let { errors, warnings } = eslintValidator.executeOnText(code, file);
      let hasWarnings = throwOnWarnings && warnings.length !== 0;
      let hasErrors = throwOnErrors && errors.length !== 0;


      if (errors.length === 0 && warnings.length === 0) {
        return null;
      }

      if (hasWarnings && hasErrors) {
        throw Error("Warnings or errors were found");
      }

      if (hasWarnings) {
        throw Error("Warnings were found");
      }

      if (hasErrors) {
        throw Error("Errors were found");
      }
    }
  };
}