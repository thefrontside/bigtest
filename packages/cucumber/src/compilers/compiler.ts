import { TypescriptCompiler } from './typescript/compiler';
import { ExternalCompiler } from 'src/types/compiler';
import { readFile } from '../promisified';
import path from 'path';
import { assert } from '../util/assert';

type SupportedFileExtensions = '.ts' | '.tsx';

type TestFile = {
  fileName: string;
  compiler: ExternalCompiler;
  code: Buffer;
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

    let compiler = this.compilers[extension];

    assert(!!compiler, `unknown file extension ${extension}`);

    return {
      fileName,
      compiler,
      code,
    };
  }

  getCompilerTasks(testFiles: TestFile[]) {
    let tasks = new WeakMap();
    let compilers = [];

    for (let testFile of testFiles) {
      let { compiler } = testFile;

      if (!tasks.has(compiler)) {
        compilers.push(compiler);
        tasks.set(compiler, []);
      }

      tasks.get(testFile.compiler).push(testFile);
    }

    return compilers.map(compiler => ({ compiler, testFiles: tasks.get(compiler) }));
  }

  async precompile(files: string[]) {
    let testFiles = await Promise.all(files.map(file => this.createFileForTesting(file)));

    let compilerTasks = this.getCompilerTasks(testFiles);

    for (let task of compilerTasks) {
      let precompiledCode = await task.compiler.precompile(task.testFiles);

      console.log(precompiledCode);
    }
  }
}
