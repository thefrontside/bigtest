/**
 * A tree of metadata describing a test and all of its children. By
 * design, this tree is as stripped down as possible so that it can be
 * seamlessly passed around from system to system. It does not include
 * any references to the functions which comprise actions and
 * assertions since they are not serializable, and cannot be shared
 * between processes.
 */
export type Test =  Node & {
  description: string;
  path?: string;
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
  path?: string;
  steps: Step[];
  assertions: Assertion[];
  children: TestImplementation[];
}

export type Action = (context: Context) => Promise<Context | void>;

/**
 * A single operation that is part of the test. It contains an Action
 * which is an `async` function that accepts the current test
 * context. If it resolves to another context, that context will be
 * merged into the current context, otherwise, the context will be
 * left alone.
 */
export interface Step extends Node {
  description: string;
  action: Action;
}

export type Check = (context: Context) => Promise<void>;

/**
 * A single assertion that is part of a test case. It accepts the
 * current text context which has been built up to this point. It
 * should throw an exception if the test is failing. Any non-error
 * result will be considered a pass.
 */
export interface Assertion extends Node {
  description: string;
  check: Check;
}

/**
 * Passed down the line from step to step and to each assertion of a
 * test.
 */
export type Context = Record<string, unknown>;

type Node = {
  description: string;
}

/**
 * State indicator for various results.
 * - pending: not yet evaluating
 * - running: is evaluating right now
 * - ok: was evaluated successfully
 * - failed: was evaluated unsuccessfully
 * - disregarded: this result can never be evaluated because of failed prerequisites
 */
export type ResultStatus = 'pending' | 'running' | 'failed' | 'ok' | 'disregarded';

/**
 * Represents the result for a single test in the tree. A TestResult is ok even if
 * one of its children is not, as long as all of its own steps and assertions pass.
 */
export interface TestResult extends Test {
  description: string;
  path?: string;
  steps: StepResult[];
  assertions: AssertionResult[];
  children: TestResult[];
  status: ResultStatus;
}

/**
 * The result of a single step
 */
export interface StepResult extends Node {
  description: string;
  status: ResultStatus;
  error?: ErrorDetails;
  timeout?: boolean;
  logEvents?: LogEvent[];
}

/**
 * The result of a single assertion
 */
export interface AssertionResult extends Node {
  description: string;
  status: ResultStatus;
  error?: ErrorDetails;
  timeout?: boolean;
  logEvents?: LogEvent[];
}

export type ConsoleLevel = 'log' | 'info' | 'debug' | 'warn' | 'error';

export type LogEvent = { type: "error"; occurredAt: string; error: ErrorDetails } | { type: "message"; occurredAt: string; message: ConsoleMessage };

export interface ConsoleMessage {
  level: ConsoleLevel;
  text: string;
}

export interface ErrorDetails {
  name?: string;
  message: string;
  stack?: ErrorStackFrame[];
}

export interface ErrorStackLocation {
  fileName?: string;
  line?: number;
  column?: number;
}

export interface ErrorStackFrame extends ErrorStackLocation {
  name?: string;
  code?: string;
  source?: ErrorStackLocation;
}
