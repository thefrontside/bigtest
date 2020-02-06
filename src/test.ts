export interface Test {
  description: string;
  steps: Iterable<Step>;
  assertions: Iterable<Assertion>;
  children: Iterable<Test>;
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

export interface SerializableTest {
  description: string;
  steps: Array<{ description: string }>;
  assertions: Array<{ description: string }>;
  children: Array<SerializableTest>;
}

export type Manifest = Iterable<{ path: string; test: SerializableTest }>;
