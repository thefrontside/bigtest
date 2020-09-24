import { Test } from '@bigtest/suite';
import * as path from 'path';
import * as fs from 'fs';

interface Options {
  files: string[];
  testFiles?: string[];
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
        let patterns = options.testFiles?.map((p) => JSON.stringify(p)).join(', ') || '';
        throw new Error(`file with path ${JSON.stringify(path.resolve(file))} exists but does not match the \`testFiles\` pattern(s) ${patterns}`.trim() +
          '. If you want to include this file in your test suite you can adjust the `testFiles` setting in `bigtest.json`.')
      } else {
        throw new Error(`file with path ${JSON.stringify(path.resolve(file))} does not exist`);
      }
    };
  } else {
    children = test.children;
  }

  return { ...test, children };
}
