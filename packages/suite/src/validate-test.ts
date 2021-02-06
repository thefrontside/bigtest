import { Test } from './interfaces';

export class FileError extends Error {
  name = 'FileError'

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

export class TestTypeError extends FileError {
  name = 'TestTypeError'

  /**
   * @hidden
   */
  constructor(message: string, test?: Test, file?: string) {
    super(`Test type error: ${message}${!!test ? `\n\n${JSON.stringify(test)}`: ''}`, file);
  }
}

export class TestValidationError extends FileError {
  name = 'TestValidationError'

  /**
   * @hidden
   */
  constructor(message: string, path: string[] = [], file?: string) {
    super(`Invalid Test: ${message}\n\nTest: ${path.join(' → ')}`, file);
  }
} 

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ensureIsTest (test: any, file?: string): test is Test {
  if(!test) {
    throw new TestTypeError("contains no required fields.\n\nDoes the test file contain a default export?", test, file)
  }
 
  if(!test.description) {
    throw new TestTypeError("contains no description.\n\nDoes the test file contain a default export?", test, file)
  }

  if(!test?.children) {
    throw new TestTypeError('contains no children.');
  }

  if(!test?.assertions) {
    throw new TestTypeError('contains no assertions.');
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
    
    if(!ensureIsTest(test, file)) {
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
