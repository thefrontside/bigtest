import { CLIEngine } from 'eslint';
import chalk from 'chalk';
import { Validator, ValidationWarning, ValidationError } from '../orchestrator/state';

const EslintOptions: CLIEngine.Options = {
  useEslintrc: false,
  allowInlineConfig: true,
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 9,
    
  },
  baseConfig: {
    root: true,
    plugins: ['bigtest'],
    rules: {
      'bigtest/require-default-export': 'error',
    },
  },
  extensions: ['.ts', '.tsx', '.js', '.jsx'],
};

export class EslintValidator implements Validator {
  private cliEngine: CLIEngine;

  constructor() {
    this.cliEngine = new CLIEngine(EslintOptions);
  }

  getErrorsAndWarnings(report: CLIEngine.LintReport) {
    let warnings: ValidationWarning[] = [];
    let errors: ValidationError[] = [];

    let lintMessages = report.results.flatMap(result =>
        result.messages
              .map(message => ({ ...message, filePath: result.filePath, parentResult: result })));

    for(let message of lintMessages) {
      if(message.severity === 0) {
        continue;
      }

      let type = (message.fatal || message.severity === 2) ? chalk.red("error") : chalk.yellow("warning");
      let msg = `${chalk.bold(message.message.replace(/([^ ])\.$/u, "$1"))}`;
      let ruleId = message.fatal ? "" : chalk.dim(`(${message.ruleId})`);
      let sourceCode = message.source || '';
  
      let firstLine = [
          `${type}:`,
          `${msg}`,
          ruleId ? `${ruleId}` : "",
          message.filePath
      ].filter(String).join(" ");

      let error: ValidationError | ValidationWarning = {
        message: message.message,
        displayMessage: msg,
        code: sourceCode,
        fileName: message.filePath,
        loc: {
          column: message.column,
          line: message.line,
          file: firstLine
        },
      };

      message.severity === 1 ? warnings.push(error) : errors.push({...error, stack: Error().stack });
    }

    return { errors, warnings };
  }

  validate(files: string[]) {
    let report = this.cliEngine.executeOnFiles(files);

    let { errors, warnings } = this.getErrorsAndWarnings(report);

    if (errors.length > 0) {
      return { type: 'INVALID', warnings, errors } as const;
    } else {
      return { type: 'VALID', warnings, errors: [] } as const;
    }
  }
}