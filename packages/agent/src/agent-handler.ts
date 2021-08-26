import { Socket } from '@bigtest/effection-express';
import { Operation } from 'effection';
import { TestEvent, AgentEvent, Command } from '../shared/protocol';

export interface AgentConnection extends Socket<TestEvent, Command> {
  /**
   * identifier of the connected agent
   */
  agentId: string;

  /**
   * Additional metadata about the agent
   */
  data: Record<string, unknown>;
}

let agentIdCounter = 1;

export function generateAgentId(): string {
  return `agent.${agentIdCounter++}`;
}

export type Handler = (connection: AgentConnection) => Operation<void>;

/**
 * Create an `AgentHandler` resource that is accepting websocket
 * connections on `port`
 */

interface AgentHandler {
  (socket: Socket<TestEvent, Command>): Operation<void>;
}

export function createAgentHandler(handler: Handler): AgentHandler {
  return function*(socket) {
    let firstMessage: AgentEvent = yield socket.expect();

    if(firstMessage.type !== 'connected') {
      throw new Error('expected first message to be a connected message, connection failed');
    }

    let agentId = firstMessage.agentId || generateAgentId();

    let connection: AgentConnection = { agentId, data: firstMessage.data, ...socket };

    yield handler(connection);
  };
}
