import { Operation, resource, spawn, contextOf, Context } from 'effection';
import { throwOnErrorEvent } from '@effection/events';
import { Subscribable } from '@effection/subscription';
import { DriverSpec, Driver } from '@bigtest/driver';
import { AgentProtocol, Command } from '@bigtest/agent';

import * as WebSocket from 'ws';

export function *create(spec: DriverSpec<NodeOptions>): Operation<Driver> {
  return yield resource(new NodeDriver(spec.options), undefined);
}

export interface NodeOptions {}

class NodeDriver {
  constructor(public options: NodeOptions) {}

  get context(): SpawnPoint {
    return contextOf(this) as unknown as SpawnPoint;
  }

  *connect(agentURL: string) {
    let url = new URL(agentURL);
    let connectTo: string = url.searchParams.get('connectTo') || '';
    let agentId: string = url.searchParams.get('agentId') || '';

    if (connectTo === '') {
      throw new Error(`unable to extract connectTo url from ${url}`);
    }

    if (agentId === '') {
      throw new Error(`unable to extract agentId url from ${url}`);
    }

    this.context.spawn(function*() {
      yield Connection.create(connectTo);
      let socket = new WebSocket(connectTo);

    })
  }
}

class Connection implements AgentProtocol, Subscribable<Command, void> {

}

interface SpawnPoint {
  spawn<T>(operation: Operation<T>): Context<T>;
}
