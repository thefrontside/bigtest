import { subscribe, Subscribable, SymbolSubscribable } from '@effection/subscription';
import { Channel } from '@effection/channel';
import { ValidatorState, Validator, BundleOptions, BundlerWarning, BundlerError } from '../../types';
import { CLIEngine } from 'eslint';
import chalk from 'chalk';

export class EslintValidator implements Validator, Subscribable<ValidatorState, undefined> {
  private channel = new Channel<ValidatorState>();
  public state: ValidatorState = { type: 'IDLE'};

  constructor(private options: BundleOptions) {
    this.options = options;
  }

  getErrorsAndWarnings(report: CLIEngine.LintReport) {
    let warnings: BundlerWarning[] = [];
    let errors: BundlerError[] = [];

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

      let error: BundlerError | BundlerWarning = {
        message: firstLine,
        code: sourceCode,
        loc: {
          column: message.column,
          line: message.line,
          file: firstLine
        },
      };

      message.severity === 1 ? warnings.push(error) : errors.push(error);
    }

    return { errors, warnings };
  }

  *validate() {
    try {
      this.state = { type: 'VALIDATING' };
      this.channel.send(this.state);
  
      let cli = new CLIEngine({
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
      });
  
      let report = cli.executeOnFiles(this.options.testFiles);

      let { errors, warnings } = this.getErrorsAndWarnings(report);
  
      // not treating warnings as errors
      if (errors.length > 0) {
        this.state = { type: 'INVALID', warnings, errors };
      } else {
        this.state = { type: 'VALID', warnings };
      }
  
      this.channel.send(this.state);
    } finally {
      console.debug(`Eslint validator finished with ${this.state.type}`)

      this.channel.close();
    }
  }
  
  *[SymbolSubscribable]() {
    return yield subscribe(this.channel);
  }
}