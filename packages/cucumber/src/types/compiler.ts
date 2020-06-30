export interface StepCode {
  fileName: string;
  code: string;
}

export interface ExternalCompiler {
  precompile(files: string[]): Promise<StepCode[]>;

  supportedExtensions: readonly string[];
}
