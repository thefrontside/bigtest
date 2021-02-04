import { Test } from './interfaces';

export class TestValidationError extends Error {
  name = 'TestValidationError'

  /**
   * The location where this error occurred.
   */
  public loc?: { file: string };

  /**
   * @hidden
   */
  constructor(message: string, path: string[] = [], file?: string) {
    super(`Invalid Test: ${message}\n\nTest: ${path.join(' → ')}`);
    if(file) {
      this.loc = { file }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ensureIsTest (test: any, path: string[] = [], file?: string): test is Test {
  if(!test) {
    throw new TestValidationError("contains no description.\n\nDoes the test file contain a default export?", path, file)
  }
 
  if(!test.description) {
    throw new TestValidationError("contains no description.\n\nDoes the test file contain a default export?", path, file)
  }

  if(!test?.children || !test?.assertions) {
    throw new TestValidationError('contains no assertions or children.');
  }

  return true;
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

/**
 * The maximum nesting depth of a test suite.
 */
export const MAXIMUM_DEPTH = 10;

/**
 * Checks whether the given {@link Test} is well formed. Note that this only
 * checks the format of the test structure, and not whether the test is
 * succeeds, or contains any other errors, such as type or logic errors.
 *
 * If the test is invalid, it will throw a {@link TestValidationError}.
 *
 * @param test The test to validate
 * @returns `true` if the test is valid, otherwise it will throw an exception
 */
export function validateTest(test: unknown): true {
  function validateTestInner(test: unknown, path?: string[], file?: string, depth = 0): true {
    if(depth > MAXIMUM_DEPTH) {
      throw new TestValidationError(`is too deeply nested, maximum allowed depth of nesting is ${MAXIMUM_DEPTH}`, [], file)
    }
    
    if(!ensureIsTest(test, path, file)) {
      throw new Error('Invalid test')
    }

    path = path ?? [test.description];
    file = file ?? test.path;

    findDuplicates(test.assertions.map((a) => a.description), (duplicate) => {
      throw new TestValidationError(`contains duplicate assertion: ${JSON.stringify(duplicate)}`, path, file)
    });

    findDuplicates(test.children.map((c) => c.description), (duplicate) => {
      throw new TestValidationError(`contains duplicate test: ${JSON.stringify(duplicate)}`, path, file)
    });

    for(let child of test.children) {
      validateTestInner(child, path.concat(child.description), child.path || file, depth + 1);
    }

    return true;
  }

  return validateTestInner(test);
}
