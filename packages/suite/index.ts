/**
 * A tree of metadata describing a test and all of its children. By
 * design, this tree is as stripped down as possible so that it can be
 * seamlessly passed around from system to system. It does not include
 * any references to the functions which comprise actions and
 * assertions since they are not serializable, and cannot be shared
 * between processes.
 */
export interface Test extends Node {
  description: string;
  steps: Node[];
  assertions: Node[];
  children: Test[];
}


/**
 * A tree of tests that is like the `Test` interface in every way
 * except that it contains the actual steps and assertions that will
 * be run. Most of the time this interface is not necessary and
 * components of the system will be working with the `Test` API, but
 * in the case of the harness which actually consumes the test
 * implementation, and in the case of the DSL which produces the test
 * implementation, it will be needed.
 */
export interface TestImplementation extends Test {
  description: string;
  steps: Step[];
  assertions: Assertion[];
  children: TestImplementation[];
}

/**
 * A single operation that is part of the test. It contains an Action
 * which is an `async` function that accepts the current test
 * context. If it resolves to another context, that context will be
 * merged into the current context, otherwise, the context will be
 * left alone.
 */

export interface Step extends Node {
  description: string;
  action: (context: Context) => Promise<Context | void>;
}

/**
 * A single assertion that is part of a test case. It accepts the
 * current text context which has been built up to this point. It
 * should throw an exception if the test is failing. Any non-error
 * result will be considered a pass.
 */
export interface Assertion extends Node {
  description: string;
  check: (context: Context) => void;
}

/**
 * Passed down the line from step to step and to each assertion of a
 * test.
 */
export type Context = Record<string, unknown>;

interface Node {
  description: string;
}
