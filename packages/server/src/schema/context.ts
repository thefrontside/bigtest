import { Mailbox } from '@bigtest/effection';
import { CommandMessage } from '../command-server';

export interface GraphqlContext {
  delegate: Mailbox<CommandMessage>;
  testRunIds: Iterator<string, never, void>;
}
