export interface ExternalCompiler {
  precompile(files: string[]): void;
  supportedExtensions: readonly string[];
}
