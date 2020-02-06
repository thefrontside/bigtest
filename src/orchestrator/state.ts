import { EventEmitter } from 'events';
import { Operation, Context } from 'effection';
import { on } from '@effection/events';

import * as R from 'ramda';

import { Test } from '../test';

export type AgentState = {
  identifier: string;
  browser: {
    name: string;
    version: string;
  };
  os: {
    name: string;
    version: string;
    versionName: string;
  };
  platform: {
    type: string;
    vendor: string;
  };
  engine: {
    name: string;
    version: string;
  };
}

export type ManifestEntry = {
  path: string;
  test: Test;
}

export type OrchestratorState = {
  agents: Record<string, AgentState>;
  manifest: ManifestEntry[];
}

class Atom {
  allocate: () => Operation;
  update: (value) => Operation;
  view: (lens) => Operation;
  over: (lens, fn) => Operation;
  get: () => Operation;
  set: (lens, value) => Operation;
  next: () => Operation;

  constructor() {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    let id: string = Symbol('Atom<State>') as any;
    let subscriptions = new EventEmitter();

    let parent: Operation = ({ resume, context: { parent }}) => resume(parent.parent);

    function* find(key: string): Operation {
      for (let current: Context = yield parent; current; current = current.parent) {
        if (current[key]) {
          return current;
        }
      }
      throw new Error('Atom not found. It must be allocated on the tree with the atom.allocate() operation');
    }

    function* get(key: string) {
      let context = yield find(key);
      return context[key];
    }

    function* set<T>(key: string, value: T) {
      let context = yield find(key);
      context[key] = value;
      subscriptions.emit('state', value);
      return value;
    }

    this.allocate = function* allocate(): Operation {
      let context = yield parent;
      context[id] = { agents: {} }
      return get(id);
    };

    this.view = function* view(lens): Operation {
      let current = yield get(id);
      return R.view(lens, current);
    }

    this.over = function* over(lens, fn) {
      let current = yield get(id);
      let next = R.over(lens, fn, current);
      return yield set(id, next);
    }

    this.get = () => this.view(R.lensPath([]));
    this.set = (lens, value) => this.over(lens, () => value);
    this.update = (value) => this.over(R.lensPath([]), value);

    this.next = function* next() {
      let [state]: [OrchestratorState] = yield on(subscriptions, 'state');
      return state;
    }
  }
}

export const atom = new Atom();
