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

const parent: Operation = ({ resume, context: { parent }}) => resume(parent.parent);

class Atom {
  // we have to trick TS into thinking this symbol is a string, that
  // way [] access will work. the id is a symbol that is used to uniquely
  // identify the atom on the stack
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  private id: string = Symbol('Atom<State>') as any;

  private *find(): Operation {
    for (let current: Context = yield parent; current; current = current.parent) {
      if (current[this.id]) {
        return current[this.id];
      }
    }
    throw new Error('Atom not found. It must be allocated on the tree with the atom.allocate() operation');
  }

  private *getState() {
    let { state } = yield this.find();
    return state;
  }

  private *setState(state: unknown) {
    let instance = yield this.find();
    Object.assign(instance, { state });
    instance.subscriptions.emit('state', state);
    return state;
  }

  *allocate(): Operation {
    let context = yield parent;
    return context[this.id] = {
      state: { agents: {} },
      subscriptions: new EventEmitter()
    }
  }

  // Ramda Lens types. How do they work?
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  *view(lens: any): Operation {
    let current = yield this.getState();
    return R.view(lens, current);
  }

  // Ramda Lens types. How do they work?
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  *over(lens: any, fn: any): Operation {
    let current = yield this.getState();
    let next = R.over(lens, fn, current);
    return yield this.setState(next);
  }

  get(): Operation {
    return this.view(R.lensPath([]));
  }

  // Ramda Lens types. How do they work?
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(lens: any, value: unknown): Operation {
    return this.over(lens, () => value);
  }

  update(state: unknown): Operation {
    return this.over(R.lensPath([]), state);
  }

  *next(): Operation {
    let { subscriptions } = yield this.find();
    let [state]: [OrchestratorState] = yield on(subscriptions, 'state');
    return state;
  }
}

export const atom = new Atom();
