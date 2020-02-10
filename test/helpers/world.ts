import { main, Context, Operation } from 'effection';
import fetch, { Response } from 'node-fetch';
import { AbortController } from 'abort-controller';
import { atom } from '../../src/orchestrator/atom';

type RequestMethod = 'post' | 'get';

export class World {
  execution: any;
  constructor() {
    this.execution = main(function*() {
      yield atom.allocate();
      yield;
    });
  }

  destroy() {
    this.execution.halt();
  }

  fork(operation: Operation): Context {
    return this.execution.spawn(operation);
  }

  get(url: string): Promise<Response>{
    return this.request('get', url);
  }

  request(method: RequestMethod, url: string): Promise<Response> {
    let controller = new AbortController();
    let { signal } = controller;
    let result = fetch(url, { method, signal });

    this.execution.ensure(() => controller.abort());

    return result;
  }
}
