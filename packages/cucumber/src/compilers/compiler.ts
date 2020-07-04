import { TypescriptCompiler } from './typescript/compiler';
import { ExternalCompiler } from 'src/types/compiler';
import { readFile } from '../promisified';
import path from 'path';
import { assert } from '../util/assert';
import { asyncFlatMap } from '../util/lists';

type SupportedFileExtensions = '.ts' | '.tsx';

type TestFile = {
  fileName: string;
  compiler: ExternalCompiler;
  code: Buffer;
};

type CompilerTask = {
  compiler: ExternalCompiler;
  testFiles: TestFile[];
};

export class Compiler {
  compilers: { [key in SupportedFileExtensions]: ExternalCompiler };

  constructor() {
    let tsc = new TypescriptCompiler();
    this.compilers = { ['.ts']: tsc, ['.tsx']: tsc };
  }

  async createFileForTesting(fileName: string): Promise<TestFile> {
    let code = await readFile(fileName);
    let extension = path.extname(fileName) as SupportedFileExtensions;

    let compiler = this.compilers[extension] as ExternalCompiler;

    assert(!!compiler, `unknown file extension ${extension}`);

    return {
      fileName,
      compiler,
      code,
    };
  }

  getCompilerTasks(testFiles: TestFile[]): CompilerTask[] {
    let tasks = new WeakMap<ExternalCompiler, TestFile[]>();
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

    return compilers.map(compiler => ({ compiler, testFiles: tasks.get(compiler) as TestFile[] }));
  }

  async precompile(files: string[]) {
    let testFiles = await Promise.all(files.map(file => this.createFileForTesting(file)));

    let compilerTasks = this.getCompilerTasks(testFiles);

    return await asyncFlatMap(compilerTasks, ({ compiler, testFiles }) =>
      compiler.precompile(testFiles.map(t => t.fileName)),
    );
  }
}
