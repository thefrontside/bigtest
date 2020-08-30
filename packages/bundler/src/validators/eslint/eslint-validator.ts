import { subscribe, Subscribable, SymbolSubscribable } from '@effection/subscription';
import { Channel } from '@effection/channel';
import { ValidatorState, Validator, BundleOptions, BundlerWarning, BundlerError } from '../../types';
import { CLIEngine } from 'eslint';

const config = {
  root: true,
  extends: undefined,
  plugins: ['bigtest'],
  rules: {
    'bigtest/require-default-test-export': 'error'
  }
} as const;
;
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
              .map(message => ({ ...message, filePath: result.filePath })));

    for(let result of lintMessages) {
      if(result.severity === 0) {
        continue;
      }

      let error: BundlerError | BundlerWarning = {
        message: result.message,
        code: result.source as string,
        loc: {
          column: result.column,
          line: result.line,
          file: result.filePath
        },
      }

      result.severity === 1 ? warnings.push(error) : errors.push(error);
    }

    return { errors, warnings };
  }

  *validate() {
    try {
      this.state = { type: 'VALIDATING' };
      this.channel.send(this.state);
  
      let cli = new CLIEngine({
        baseConfig: {
          ...config
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
      });
  
      let report = cli.executeOnFiles(this.options.testFiles);
  
      let { errors, warnings } = this.getErrorsAndWarnings(report);
  
      // not treating warnings as errors
      if(errors.length > 0){
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