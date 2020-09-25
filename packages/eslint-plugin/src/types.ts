export interface Validator<R, O extends Record<string, unknown> = {}> {
  validate(files: string | readonly string[], options?: O): Promise<R>;
}

export type ValidationException = {
  name: string;
  fileName: string;
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

export type ValidationState = 
| { type: 'INVALID'; errors: ValidationError[]; warnings: ValidationWarning[] }
| { type: 'VALID'; warnings: ValidationWarning[] }
