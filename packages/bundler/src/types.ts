import { RollupWarning, RollupError } from 'rollup';

export type BundlerError = RollupError;
export type BundlerWarning = RollupWarning;

// TODO: All errors could implement at least these fields?
export type ValidationException = {
  fileName: string;
  message: string;
  displayMessage?: string;
  code?: string;
  frame?: string;
	loc?: {
    column: number;
		file?: string;
		line: number;
  };
}

export type ValidationWarning = ValidationException;
export type ValidationError = ValidationException & {
  stack?: string;
}

export type BundlerMessage =
  | { type: 'START' }
  | { type: 'VALIDATING' }
  | { type: 'INVALID'; errors: ValidationError[] }
  | { type: 'UPDATE' }
  | { type: 'WARN'; warning: BundlerWarning }
  | { type: 'ERROR'; error: BundlerError }
