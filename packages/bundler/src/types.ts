import { RollupWarning, RollupError } from 'rollup';
import { ProjectOptions } from '@bigtest/project';

export type BundlerError = RollupError;
export type BundlerWarning = RollupWarning;

export type ValidationException = {
  name: string;
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

export type BundlerState =
  | { type: 'UNBUNDLED' }
  | { type: 'VALIDATING' }
  | { type: 'INVALID'; errors: ValidationError[]; warnings: ValidationWarning[] }
  | { type: 'VALID'; warnings: ValidationWarning[] }
  | { type: 'BUILDING'; warnings: BundlerWarning[] }
  | { type: 'UPDATE'; warnings: BundlerWarning[] }
  | { type: 'GREEN'; path: string;  warnings: BundlerWarning[] }
  | { type: 'ERRORED'; error: BundlerError }

export type BundlerTypes = Pick<BundlerState, 'type'>['type'];

export type BundleOptions = {
  entry: string;
  outFile: string;
  globalName?: string;
  testFiles: string[];
} & Pick<ProjectOptions, 'testFiles'>;

export type BundlerMessage =
  | { type: 'START' }
  | { type: 'VALIDATING' }
  | { type: 'INVALID'; errors: ValidationError[] }
  | { type: 'UPDATE' }
  | { type: 'WARN'; warning: BundlerWarning }
  | { type: 'ERROR'; error: BundlerError }