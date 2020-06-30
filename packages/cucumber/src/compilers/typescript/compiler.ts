import { exec } from 'child_process';
import { ExternalCompiler } from 'src/types/compiler';
import ts, { TranspileOptions, CompilerOptions, Diagnostic } from 'typescript';
import path from 'path';
import { readFile } from '../../promisified';
import JSON5 from 'json5';

const CWD = process.cwd();

export const EssentialCompilerOptions: Partial<CompilerOptions> = {
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  allowJs: true,
  pretty: true,
  inlineSourceMap: true,
  jsx: ts.JsxEmit.React,
  suppressOutputPathCheck: true,
  skipLibCheck: true,
} as const;

export class TypescriptCompiler implements ExternalCompiler {
  supportedExtensions = ['.ts', '.tsx'] as const;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  cache: any;

  constructor() {
    this.cache = Object.create(null);
  }

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
    let filePath = path.join(CWD, 'tsconfig.json');

    let configFile = await readFile(filePath);

    let tsConfig = JSON5.parse(configFile.toString()) as TranspileOptions;

    return { ...EssentialCompilerOptions, ...tsConfig.compilerOptions };
  }

  async precompile(files: string[]) {
    let options = await this.getOptions();
    let program = ts.createProgram(files, options);

    let diagnostics = ts.getPreEmitDiagnostics(program);

    if (diagnostics.length > 0) {
      this.reportErrors(diagnostics);
    }

    program.emit(void 0, (outputName, result, writeBOM, onError, sources) => {
      if (!sources) return;

      console.log(sources);

      this.cache[sources[0].fileName] = result;

      console.log(this.cache);
    });
  }
}

export const compile = async (file: string) => {
  return new Promise<void>((resolve, reject) => {
    // TODO: very lazy should use
    // import tsc from 'typescript';
    // set compilerOptions etc. but this is a spike
    let tscCommand = `yarn run tsc ${file}`;

    let tsc = exec(tscCommand);

    tsc.stdout?.on('data', data => console.info(data));
    tsc.stderr?.on('data', data => console.error(data));

    tsc.on('close', code => {
      console.log(`tsc exited with code ${code}`);

      if (code !== 0) {
        reject(new Error('it no work'));
      }

      resolve();
    });
  });
};
