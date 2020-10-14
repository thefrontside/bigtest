import { Test } from './interfaces';

type Loc = {
  file: string;
}

class TestValidationError extends Error {
  name = 'TestValidationError'

  public loc?: Loc;

  constructor(message: string, file?: string) {
    super(message);
    if(file) {
      this.loc = { file }
    }
  }
}

function findDuplicates<T>(array: T[], callback: (value: T) => void) {
  let ledger = new Set();
  for(let element of array) {
    if(ledger.has(element)) {
      callback(element);
    }
    ledger.add(element);
  }
}

export const MAXIMUM_DEPTH = 10;

export function validateTest(test: Test): true {
  function validateTestInner(test: Test, path: string[] = [], file?: string, depth = 0): true {
    if(depth > MAXIMUM_DEPTH) {
      throw new TestValidationError(`Invalid Test: is too deeply nested, maximum allowed depth of nesting is ${MAXIMUM_DEPTH}\n\nTest: ${path.join(' → ')}`, file)
    }

    findDuplicates(test.assertions.map((a) => a.description), (duplicate) => {
      throw new TestValidationError(`Invalid Test: contains duplicate assertion: ${JSON.stringify(duplicate)}\n\nTest: ${path.join(' → ')}`, file)
    });

    findDuplicates(test.children.map((c) => c.description), (duplicate) => {
      throw new TestValidationError(`Invalid Test: contains duplicate test: ${JSON.stringify(duplicate)}\n\nTest: ${path.join(' → ')}`, file)
    });

    for(let child of test.children) {
      validateTestInner(child, path.concat(child.description), child.path || file, depth + 1);
    }

    return true;
  }
  return validateTestInner(test, [test.description], test.path);
}
