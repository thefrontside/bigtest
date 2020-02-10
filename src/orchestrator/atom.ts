import * as R from 'ramda';

import { EventEmitter } from 'events';
import { Operation, Context } from 'effection';
import { on } from '@effection/events';

import { OrchestratorState } from './state';

export class Atom {
  private state: OrchestratorState = {
    manifest: [],
    agents: {}
  };

  private subscriptions = new EventEmitter();

  private *getState() {
    return this.state;
  }

  private *setState(state: OrchestratorState) {
    this.state = state;
    this.subscriptions.emit('state', state);
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
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    return yield this.setState(next as any as OrchestratorState);
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
    let [state]: [OrchestratorState] = yield on(this.subscriptions, 'state');
    return state;
  }
}

export const atom = new Atom();
