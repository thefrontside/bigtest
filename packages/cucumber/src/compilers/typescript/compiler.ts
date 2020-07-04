import { ExternalCompiler } from 'src/types/compiler';
import ts, { TranspileOptions, CompilerOptions, Diagnostic } from 'typescript';
import path from 'path';
import { readFile } from '../../promisified';
import JSON5 from 'json5';
import { assert } from '../../util/assert';

const CWD = process.cwd();

export const EssentialCompilerOptions: Partial<CompilerOptions> = {
  allowJs: true,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  inlineSourceMap: true,
  jsx: ts.JsxEmit.React,
  noImplicitAny: false,
  module: ts.ModuleKind.CommonJS,
  moduleResolution: ts.ModuleResolutionKind.NodeJs,
  pretty: true,
  suppressOutputPathCheck: true,
  skipLibCheck: true,
  target: ts.ScriptTarget.ES2019,
};

export const NonOverridableCompilerOptions = ['module', 'moduleResolution', 'target', 'sourceMap', 'lib', 'target'];

export class TypescriptCompiler implements ExternalCompiler<ts.OutputFile> {
  supportedExtensions = ['.ts', '.tsx'] as const;

  reportErrors(diagnostics: readonly Diagnostic[]) {
    let errMsg = 'TypeScript compilation failed.\n';

    diagnostics.forEach(diagnostic => {
      let message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
      let file = diagnostic.file;

      if (file && diagnostic.start !== void 0) {
        let { line, character } = file.getLineAndCharacterOfPosition(diagnostic.start);

        errMsg += `${file.fileName} (${line + 1}, ${character + 1}): `;
      }

      errMsg += `${message}\n`;
    });

    throw new Error(errMsg);
  }

  async getOptions() {
    let tsconfigPath = path.join(CWD, 'tsconfig.json');

    let configFile = await readFile(tsconfigPath);

    let tsConfig = JSON5.parse(configFile.toString()) as TranspileOptions;

    assert(tsConfig.compilerOptions, 'no compiler options defined');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let host: any = ts.sys;

    return ts.getParsedCommandLineOfConfigFile(
      tsconfigPath,
      { ...EssentialCompilerOptions, ...tsConfig.compilerOptions },
      host,
    )?.options as CompilerOptions;
  }

  async precompile(files: string[]): Promise<ts.OutputFile> {
    let options = await this.getOptions();

    let appTsConfig: Partial<CompilerOptions> = {};

    for (let [key, value] of Object.entries(options).filter(([key]) => !NonOverridableCompilerOptions.includes(key))) {
      appTsConfig[key] = value;
    }

    let program = ts.createProgram({ rootNames: files, options: appTsConfig });

    let diagnostics = ts.getPreEmitDiagnostics(program);

    if (diagnostics.length > 0) {
      this.reportErrors(diagnostics);
    }

    let outputFiles: ts.OutputFile[] = [];

    let writeFile = (fileName: string, text: string, writeByteOrderMark: boolean) => {
      if (fileName.endsWith('.js')) {
        outputFiles.push({ name: fileName, writeByteOrderMark, text });
      }
    };

    program.emit(void 0, writeFile);

    return outputFiles[0];
  }
}
