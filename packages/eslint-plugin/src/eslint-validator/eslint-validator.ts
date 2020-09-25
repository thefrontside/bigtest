import { ESLint } from 'eslint';
import { ValidationWarning, ValidationError, Validator, ValidationState } from '../types';
import { EslintOptions } from './eslint-options';

export type EslintValidatorOptions = {
  format: 'stylish' | 'codeframe';
}

export class EslintValidator implements Validator<ValidationState, EslintValidatorOptions> {
  private eslintCli: ESLint;
  private formatter?: ESLint.Formatter;

  constructor() {
    this.eslintCli = new ESLint(EslintOptions);
  }

  async getFormatter(options: EslintValidatorOptions) {
    return this.formatter ?? this.eslintCli.loadFormatter(options.format)
  }

  async getLintBundlerState(reports: ESLint.LintResult[], options: EslintValidatorOptions): Promise<ValidationState> {
    let warnings: ValidationWarning[] = [];
    let errors: ValidationError[] = [];

    let formatter = await this.getFormatter(options);
    
    let lintResults = reports.flatMap(report =>
        report.messages.map(message => 
                              ({ ...message, filePath: report.filePath, report })));

    for(let lintResult of lintResults) {
      if(lintResult.severity === 0) {
        continue;
      }

      let output = formatter.format([lintResult.report]);

      let sourceCode = lintResult.source || '';

      let error: ValidationError | ValidationWarning = {
        name: lintResult.ruleId as string,
        message: lintResult.message,
        displayMessage: output,
        code: sourceCode,
        fileName: lintResult.filePath,
        loc: {
          column: lintResult.column,
          line: lintResult.line,
          file: lintResult.filePath
        },
      };

      lintResult.severity === 1 ? warnings.push(error) : errors.push({ ...error, stack: Error().stack });
    }

    if (errors.length === 0) {
      return { type: 'VALID', warnings } as const;
    } else {
      return { type: 'INVALID', warnings, errors } as const;
    }
  }

  async validate(files: string | string[], options: EslintValidatorOptions = { format: 'codeframe' }): Promise<ValidationState> {
    let reports: ESLint.LintResult[] = await this.eslintCli.lintFiles(files);

    return this.getLintBundlerState(reports, options);
  }
}