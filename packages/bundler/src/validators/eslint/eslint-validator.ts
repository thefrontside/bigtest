import { subscribe, Subscribable, SymbolSubscribable } from '@effection/subscription';
import { Channel } from '@effection/channel';
import { ValidatorState, Validator, BundleOptions, ValidationWarning, ValidationError } from '../../types';
import * as fs from 'fs';
import * as path from 'path';
import { CLIEngine } from 'eslint';

const { writeFile } = fs.promises;

const config = {
  root: true,
  extends: [],
  plugins: ['bigtest'],
  rules: {
    'bigtest/require-default-test-export': 'error'
  }
} as const;

export class EslintValidator implements Validator, Subscribable<ValidatorState, undefined> {
  private channel = new Channel<ValidatorState>();
  public state: ValidatorState = { type: 'IDLE'};

  constructor(private options: BundleOptions) {
    this.options = options;
  }
  
  // don't think this is necessary
  *writeEslintConfig() {
    let file = path.join(this.options.dir, '.eslintrc.js');

    try {
      yield writeFile(
        file,
        `module.exports = ${JSON.stringify(config, null, 2)}`,
        { flag: 'wx' }
      );
    } catch (e) {
      if (e.code === 'EEXIST') {
        console.error(
          'Error trying to save the Eslint configuration file:',
          `${file} already exists.`
        );
      } else {
        console.error(e);
      }
  
      return config;
    }
  }

  *validate() {
    this.state = { type: 'VALIDATING' };
    this.channel.send(this.state);

    // don't think this is necessary
    // yield this.writeEslintConfig(); 

    let cli = new CLIEngine({
      baseConfig: {
        ...config
      },
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    });

    let report = cli.executeOnFiles(this.options.testFiles);

    // console.error(cli.getFormatter()(report.results));

    if(report.errorCount || report.warningCount){
      console.error('errors');
      let warnings: ValidationWarning[] = [];
      let errors: ValidationError[] = [];
      
      for(let result of report.results.flatMap(result => result.messages)) {
        if(result.severity === 0) {
          continue;
        }

        result.severity === 1 ? warnings.push(result.message) : errors.push(result.message);
      }


      this.state = { type: 'INVALID', warnings, errors };
      console.error(this.state)
      
      this.channel.send(this.state);
      
      return;
    }

    this.state = { type: 'VALID' };
    this.channel.send(this.state);
  }
  
  *[SymbolSubscribable]() {
    return yield subscribe(this.channel);
  }
}