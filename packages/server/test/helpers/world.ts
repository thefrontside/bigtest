import { main, Context, Operation } from 'effection';
import fetch, { Response, RequestInfo, RequestInit } from 'node-fetch';
import { AbortController } from 'abort-controller';

export class World {
  execution: Context;
  constructor() {
    this.execution = main(function*() { yield; });
  }

  destroy() {
    this.execution.halt();
  }

  fork(operation: Operation): Context {
    return this.execution['spawn'](operation);
  }

  fetch(resource: RequestInfo, init: RequestInit = {}): Promise<Response> {
    let controller = new AbortController();
    init.signal = controller.signal;

    let result = fetch(resource, init);

    this.execution['ensure'](() => controller.abort());

    return result;
  }
}
