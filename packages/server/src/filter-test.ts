import { Test } from '@bigtest/suite';
import * as path from 'path';
import * as fs from 'fs';

interface Options {
  files: string[];
}

function comparePaths(a: string, b: string) {
  return path.resolve(a) === path.resolve(b);
}

export function filterTest(test: Test, options: Options): Test {
  let children: Test[] = [];

  if(options.files.length) {
    for(let file of options.files) {
      let child = test.children.find((c) => c.path && comparePaths(c.path, file));

      if(child) {
        children.push(child);
      } else if(fs.existsSync(file)) {
        throw new Error(`file with path '${path.resolve(file)}' exists, but is not part of your test files, if you want to run this test, adjust the 'testFiles' setting in 'bigtest.json'`)
      } else {
        throw new Error(`file with path '${path.resolve(file)}' does not exist`);
      }
    };
  } else {
    children = test.children;
  }

  return { ...test, children };
}
