import * as R from 'ramda';

import { EventEmitter } from 'events';
import { Operation } from 'effection';
import { once } from '@bigtest/effection';

import { OrchestratorState } from './state';

export class Atom {
  private state: OrchestratorState = {
    manifest: {
      description: 'None',
      fileName: '<init>',
      steps: [],
      assertions: [],
      children: []
    },
    agents: {}
  };

  private subscriptions = new EventEmitter();

  get(): OrchestratorState {
    return this.state;
  }

  update(fn: (state: OrchestratorState) => OrchestratorState) {
    this.state = fn(this.get());
    this.subscriptions.emit('state', this.state);
  }

  slice<T>(path: string[]): Slice<T> {
    return new Slice(this, path);
  }

  *next(): Operation {
    let [state]: [OrchestratorState] = yield once(this.subscriptions, 'state');
    return state;
  }
}

import { lensPath } from 'ramda';

export class Slice<T> {
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  lens: any;

  constructor(private atom: Atom, public path: string[]) {
    this.lens = lensPath(path);
  }

  get state() { return this.atom.get(); }

  get(): T {
    return R.view(this.lens)(this.state) as T;
  }

  set(value: T): void {
    this.atom.update(state => {
      return R.set(this.lens, value, state) as unknown as OrchestratorState;
    });
  }

  over(fn: (value: T) => T): void {
    this.atom.update(state => R.over(this.lens, fn, state) as unknown as OrchestratorState);
  }

  slice<T>(path: string[]): Slice<T> {
    return new Slice(this.atom, this.path.concat(path));
  }

  remove(): void {
    // If this is the root, then it cannot be removed.
    if (this.path.length === 0) { return; }

    let parentPath = this.path.slice(0, -1);
    let parentLens = R.lensPath(parentPath);
    let parent = R.view(parentLens, this.state);
    if (Array.isArray(parent)) {
      this.atom.update(state => {
        let array = parent as unknown[];
        return R.set(parentLens, array.filter(el => el !== this.get()), state) as unknown as OrchestratorState;
      })
    } else {
      let [property] = this.path.slice(-1);
      this.atom.update(state => {
        return R.set(parentLens, R.dissoc(property, parent), state) as unknown as OrchestratorState;
      })
    }
  }

  *next(): Operation {
    let state: OrchestratorState = yield this.atom.next();
    return R.view(this.lens, state);
  }
}
