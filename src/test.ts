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

export interface Manifest {
  url: string;
  entries: ManifestEntry[];
}

export type ManifestEntry = {
  path: string;
  test: Test;
}


/**
 * Used to take the raw data of a manifest and provide a "smart" API
 * over the. Specifically, to support operations like finding a Test
 * by id or path.
 */
export class TestIndex implements Test {

  static separator = ' > ';

  constructor(private test: Test, public path: string[]) {}

  static fromManifest(manifest: Manifest): TestIndex {
    return new TestIndex({
      description: 'All Tests',
      steps: [],
      assertions: [],
      children: map(({ test }) => new TestIndex(test, [test.description]), manifest.entries)
    }, []);
  }

  get id() { return this.path.join(TestIndex.separator); }
  get description() { return this.test.description; }
  get steps() { return this.test.steps; }
  get assertions() { return this.test.assertions; }
  get children() { return map(test => new TestIndex(test, this.path.concat(test.description)), this.test.children); }


  findByPath(path: string[], fullPathId = path.join(TestIndex.separator)): TestIndex {
    if (path.length === 0) {
      return this;
    }
    let [description, ...rest] = path;
    for (let child of this.children) {
      if (child.description === description) {
        return child.findByPath(rest, fullPathId);
      }
    }
    throw new Error(`IndexError: when looking up path '${fullPathId}', could not find '${this.path.concat(description).join(TestIndex.separator)}'`)
  }

  findById(id: string): TestIndex {
    return this.findByPath(id.split(TestIndex.separator));
  }
}

function* map<Input, Output>(fn: ((input: Input) => Output), inputs: Iterable<Input>): Iterable<Output> {
  for (let input of inputs) {
    yield fn(input);
  }
}
