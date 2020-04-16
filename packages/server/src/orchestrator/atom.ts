import { lensPath, view, set, dissoc, over } from 'ramda';

import { EventEmitter } from 'events';
import { Operation } from 'effection';
import { Mailbox } from '@bigtest/effection';

import { OrchestratorState } from './state';

export class Atom {
  private initial: OrchestratorState = {
    manifest: {
      description: 'None',
      fileName: '<init>',
      steps: [],
      assertions: [],
      children: []
    },
    agents: {},
    testRuns: {},
  };

  private state = this.initial;

  private subscriptions = new EventEmitter();

  get(): OrchestratorState {
    return this.state;
  }

  reset(initializer?: (initial: OrchestratorState, current: OrchestratorState) => OrchestratorState) {
    if (!initializer) {
      initializer = initial => initial;
    }
    this.state = initializer(this.initial, this.state);
    this.subscriptions.removeAllListeners();
  }

  update(fn: (state: OrchestratorState) => OrchestratorState) {
    this.state = fn(this.get());
    this.subscriptions.emit('state', this.state);
  }

  slice<T>(path: string[]): Slice<T> {
    return new Slice(this, path);
  }

  *each(fn: (state: OrchestratorState) => Operation) {
    let mailbox = yield Mailbox.subscribe(this.subscriptions, "state");

    while (true) {
      let { args: [state] } = yield mailbox.receive();
      yield fn(state);
    }
  }
}

export class Slice<T> {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  lens: any;

  constructor(private atom: Atom, public path: Array<string|number>) {
    this.lens = lensPath(path);
  }

  get state() { return this.atom.get(); }

  get(): T {
    return view(this.lens)(this.state) as T;
  }

  set(value: T): void {
    this.atom.update(state => {
      return set(this.lens, value, state) as unknown as OrchestratorState;
    });
  }

  over(fn: (value: T) => T): void {
    this.atom.update(state => over(this.lens, fn, state) as unknown as OrchestratorState);
  }

  slice<T>(path: Array<string|number>): Slice<T> {
    return new Slice(this.atom, this.path.concat(path));
  }

  remove(): void {
    // If this is the root, then it cannot be removed.
    if (this.path.length === 0) { return; }

    let parentPath = this.path.slice(0, -1);
    let parentLens = lensPath(parentPath);
    let parent = view(parentLens, this.state);
    if (Array.isArray(parent)) {
      this.atom.update(state => {
        let array = parent as unknown[];
        return set(parentLens, array.filter(el => el !== this.get()), state) as unknown as OrchestratorState;
      })
    } else {
      let [property] = this.path.slice(-1);
      this.atom.update(state => {
        return set(parentLens, dissoc(property, parent), state) as unknown as OrchestratorState;
      })
    }
  }
}
