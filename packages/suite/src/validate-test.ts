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

const every = Array.prototype.every;
const some = Array.prototype.some;

function validateTestKeys (test: Test, keys: (keyof Test)[], validationFn: typeof some | typeof every): boolean {
  // the disable comment below is because eslint is not recognising k as used in !!test?.[k].
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return validationFn.call(keys, (k: keyof Test) => !!test?.[k]);
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

    if ( validateTestKeys(test, ['description'], every) === false) {
      throw new TestValidationError(`Invalid Test: Test contains no description.\n\nDoes the test file contain a default export? Test: ${path.join(' → ')}`, file);
    }

    if ( validateTestKeys(test, ['assertions', 'children'], some) === false) {
      throw new TestValidationError(`Invalid Test: Test contains no assertions or children.\n\nTest: ${[test.description].join(' → ')}`, test.path);
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
