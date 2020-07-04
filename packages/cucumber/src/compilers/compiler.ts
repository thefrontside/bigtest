import { TypescriptCompiler } from './typescript/compiler';
import { ExternalCompiler } from 'src/types/compiler';
import { readFile } from '../promisified';
import path from 'path';
import { assert } from '../util/assert';
import ts from 'typescript';

type SupportedFileExtensions = '.ts' | '.tsx';

type TestFile<R = unknown> = {
  fileName: string;
  compiler: ExternalCompiler<R>;
  code: Buffer;
};

export class Compiler {
  compilers: { [key in SupportedFileExtensions]: ExternalCompiler };

  constructor() {
    let tsc = new TypescriptCompiler();
    this.compilers = { ['.ts']: tsc, ['.tsx']: tsc };
  }

  async createFileForTesting(fileName: string): Promise<TestFile<ts.OutputFile>> {
    let code = await readFile(fileName);
    let extension = path.extname(fileName) as SupportedFileExtensions;

    let compiler = this.compilers[extension] as ExternalCompiler<ts.OutputFile>;

    assert(!!compiler, `unknown file extension ${extension}`);

    return {
      fileName,
      compiler,
      code,
    };
  }

  getCompilerTasks(testFiles: TestFile<ts.OutputFile>[]) {
    let tasks = new WeakMap<ExternalCompiler, TestFile<ts.OutputFile>[]>();
    let compilers = [];

    for (let testFile of testFiles) {
      let { compiler } = testFile;

      if (!tasks.has(compiler)) {
        compilers.push(compiler);
        tasks.set(compiler, []);
      }

      let taskFiles = tasks.get(testFile.compiler);

      assert(!!taskFiles, 'no task files in task');

      taskFiles.push(testFile);
    }

    return compilers.map(compiler => ({ compiler, testFiles: tasks.get(compiler) as TestFile<ts.OutputFile>[] }));
  }

  async precompile(files: string[]) {
    let testFiles = await Promise.all(files.map(file => this.createFileForTesting(file)));

    let compilerTasks = this.getCompilerTasks(testFiles);

    return await Promise.all(
      compilerTasks.flatMap(({ compiler, testFiles }) => compiler.precompile(testFiles.map(t => t.fileName))),
    );
  }
}
