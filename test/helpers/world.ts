import { fork, Execution, Operation } from 'effection';
import fetch, { Response } from 'node-fetch';
import { AbortController } from 'abort-controller';

type RequestMethod = 'post' | 'get';

export class World {
  execution: Execution;
  constructor() {
    this.execution = fork(function*() { yield; });
  }

  destroy() {
    this.execution.halt();
  }

  fork(operation: Operation): Execution {
    return (this.execution as any).fork(operation);
  }

  get(url: string): Promise<Response>{
    return this.request('get', url);
  }

  request(method: RequestMethod, url: string): Promise<Response> {
    let controller = new AbortController();
    let { signal } = controller;
    let result = fetch(url, { method, signal });

    this.execution.atExit(() => controller.abort());

    return result;
  }
}
