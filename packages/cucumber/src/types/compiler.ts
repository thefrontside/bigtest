export interface ExternalCompiler<R = unknown> {
  precompile(files: string[]): Promise<R>;
  supportedExtensions: readonly string[];
}
