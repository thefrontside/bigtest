export interface Test {
  steps: Step[];
  assertions: Assertion[];
  children: Test[];
  description: string;
  fileName?: string;
  path?: string;
}

export interface Step {
  description: string;
  action: Action;
}

export interface Assertion {
  description: string;
  check: Check;
}

export interface Action {
  (context: Context): Promise<Context | void>;
}

export interface Check {
  (context: Context): void;
}

export type Context = Record<string, unknown>;
