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
