/**
 * A common base type for various nodes in test trees.
 */
export interface Node {
  /** The human readable description of the test */
  description: string;
}

/**
 * A tree which describes a test and all of its children. This interface
 * describes the shape of a test without including any of the functions which
 * comprise actions and assertions. This allows the test to be serialized and
 * shared.
 */
export interface Test extends Node {
  /** @hidden */
  path?: string;
  steps: Node[];
  assertions: Node[];
  children: Test[];
}


/**
 * A tree that is like the {@link Test} interface in every way
 * except that it contains the actual steps and assertions that will
 * be run.
 *
 * It represents the full implementation of a test and is is what is normally
 * exported from a test file.
 */
export interface TestImplementation extends Test {
  steps: Step[];
  assertions: Assertion[];
  children: TestImplementation[];
}

/**
 * An `async` function that accepts the current test context. If it resolves to
 * another context, that context will be merged into the current context,
 * otherwise, the context will be left alone.
 */
export type Action = (context: Context) => Promise<Context | void>;

/**
 * A step which forms part of a test. Steps are executed in sequence. If one
 * step fails, subsequent steps will be disregarded. Once all steps complete
 * successfully, any assertions will run.
 */
export interface Step extends Node {
  action: Action;
}

export type Check = (context: Context) => Promise<void>;

/**
 * A single assertion that is part of a test case. It accepts the current text
 * context which has been built up to this point. It should throw an exception
 * if the test is failing. Any non-error result will be considered a pass.
 */
export interface Assertion extends Node {
  check: Check;
}

/**
 * Passed down the line from step to step and to each assertion of a test.
 */
export type Context = Record<string, unknown>;

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
 * Represents the result of running a {@link Test}. The status of the test is
 * an aggregate of the steps and assertions it contains. Only if all steps and
 * assertions pass is the test marked as `ok`.
 *
 * A TestResult is ok even if one of its children is not, as long as all of its
 * own steps and assertions pass.
 */
export interface TestResult extends Test {
  status: ResultStatus;
  steps: StepResult[];
  assertions: AssertionResult[];
  children: TestResult[];
}

/**
 * The result of a single {@link Step}.
 */
export interface StepResult extends Node {
  status: ResultStatus;
  /** If the status was `failed` then this may provide further details about the cause of failure */
  error?: ErrorDetails;
  /** True if the failure was caused by a timeout */
  timeout?: boolean;
  /** Any log events which are generated through uncaught errors, or log messages written to the console */
  logEvents?: LogEvent[];
}

/**
 * The result of a single {@link Assertion}.
 */
export interface AssertionResult extends Node {
  status: ResultStatus;
  /** If the status was `failed` then this may provide further details about the cause of failure */
  error?: ErrorDetails;
  /** True if the failure was caused by a timeout */
  timeout?: boolean;
  /** Any log events which are generated through uncaught errors, or log messages written to the console */
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
