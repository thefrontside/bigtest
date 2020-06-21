import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { Module } from 'module';

export const compileFile = async (file: string) => {
  return new Promise<void>((resolve, reject) => {
    // TODO: very lazy should use import tsc from 'typescript';
    // set compilerOptions etc. but this is a spike
    let tscCommand = `yarn run tsc ${file}`;
    console.log(tscCommand);

    console.log(`running tsc`);

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

const getNodeModulesLookupPath = (filename: string) => {
  let dir = path.dirname(filename);
  return (Module as any)._nodeModulePaths(dir);
};

export const runCode = (code: string, fileName: string) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mod = new Module(fileName, module.parent as any);
  mod.filename = fileName;
  mod.paths = getNodeModulesLookupPath(fileName);
  (mod as any)._compile(code, fileName);
};

const trimExtension = (file: string) => file.substring(0, file.lastIndexOf('.')) || file;

export const executeSteps = async (filePaths: string[]) => {
  let results: { code: string; fileName: string }[] = [];

  for (let filePath of filePaths) {
    await compileFile(filePath);

    let fileName = `${trimExtension(filePath)}.js`;
    let code = fs.readFileSync(fileName, 'utf-8');

    runCode(code, fileName);
    return { code, fileName };
  }

  return results;
};
