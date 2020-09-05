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
