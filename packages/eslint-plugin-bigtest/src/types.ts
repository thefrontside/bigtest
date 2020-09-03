// TODO: All errors could implement at least these fields?
export type ValidationException = {
  code?: string;
  frame?: string;
  message: string;
  displayMessage: string;
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

export type ValidatorState = 
| { type: 'IDLE' }
| { type: 'VALIDATING' }
| { type: 'INVALID'; errors: ValidationException[]; warnings: ValidationException[] }
| { type: 'VALID'; warnings: ValidationException[] }

export interface Validator {
  validate(): void;
  state: ValidatorState;
}