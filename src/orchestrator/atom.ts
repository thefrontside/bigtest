import * as R from 'ramda';

import { EventEmitter } from 'events';
import { Operation } from 'effection';
import { on } from '@effection/events';

import { OrchestratorState } from './state';

export class Atom {
  private state: OrchestratorState = {
    manifest: [],
    agents: {}
  };

  private subscriptions = new EventEmitter();

  get(): OrchestratorState {
    return this.state;
  }

  update(fn: (OrchestratorState) => OrchestratorState) {
    this.state = fn(this.get());
    this.subscriptions.emit('state', this.state);
  }

  // Ramda Lens types. How do they work?
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  view(lens: any): unknown {
    return R.view(lens, this.get());
  }

  // Ramda Lens types. How do they work?
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  over(lens: any, fn: any) {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.update(R.over(lens, fn) as any as (OrchestratorState) => OrchestratorState);
  }

  // Ramda Lens types. How do they work?
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  set(lens: any, value: unknown) {
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.update(R.set(lens, value) as any as (OrchestratorState) => OrchestratorState);
  }

  *next(): Operation {
    let [state]: [OrchestratorState] = yield on(this.subscriptions, 'state');
    return state;
  }
}
