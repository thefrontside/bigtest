import { RollupWarning, RollupError } from 'rollup';
import { ProjectOptions } from '@bigtest/project';

export type BundlerError = RollupError;
export type BundlerWarning = RollupWarning;

export type BundlerMessage =
  | { type: 'VALIDATING'}
  | { type: 'VALID' }
  | { type: 'INVALID'; warnings: BundlerWarning[]; errors: BundlerError[] }
  | { type: 'START' }
  | { type: 'UPDATE' }
  | { type: 'WARN'; warning: BundlerWarning }
  | { type: 'ERROR'; errors: BundlerError[] }

export type ValidatorState = 
| { type: 'IDLE' }
| { type: 'VALIDATING' }
| { type: 'INVALID'; errors: BundlerError[]; warnings: BundlerWarning[] }
| { type: 'VALID'; warnings: BundlerWarning[] }

export type BundleOptions = {
  entry: string;
  outFile: string;
  globalName?: string;
  testFiles: string[];
} & Pick<ProjectOptions, 'testFiles'>;

export interface BundlerOptions {
  mainFields: ("browser" | "main" | "module")[];
};

export interface ValidatorOptions {
  testDir: string;
}

export interface Validator {
  validate(): void;
  state: ValidatorState;
}