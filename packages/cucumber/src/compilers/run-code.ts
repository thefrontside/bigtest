/* eslint-disable @typescript-eslint/no-explicit-any */
import path from 'path';
import { Module } from 'module';

const getNodeModulesLookupPath = (filename: string) => {
  let dir = path.dirname(filename);
  return (Module as any)._nodeModulePaths(dir);
};

export const runCode = (code: string, fileName: string) => {
  let mod = new Module(fileName, module.parent as any);
  mod.filename = fileName;
  mod.paths = getNodeModulesLookupPath(fileName);
  (mod as any)._compile(code, fileName);
};
