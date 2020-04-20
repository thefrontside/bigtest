import { Mailbox } from '@bigtest/effection';

export interface GraphqlContext {
  delegate: Mailbox;
  testRunIds: Iterator<string, never, void>;
}
