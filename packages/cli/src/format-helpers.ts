import * as chalk from 'chalk';
import { ProjectOptions } from '@bigtest/project';
import { ResultStatus } from '@bigtest/suite'
import { RunResultEvent } from './query'

export { ResultStatus } from '@bigtest/suite'
export { RunResultEvent } from './query'
export type Counts = { ok: number; failed: number; disregarded: number };

export type Summary = {
  status: ResultStatus;
  duration: number;
  stepCounts: Counts;
  assertionCounts: Counts;
}

export function icon(event: RunResultEvent) {
  if(event.type.match(/^:running$/)) {
    return "↻";
  } 

  return statusIcon(event.status || '', chalk.green("✓"));
}

export function statusIcon(status: string , okayIcon: string) {
  if(status === 'ok') {
    return okayIcon;
  } else if(status === 'failed') {
    return chalk.red("⨯");
  } else if(status === 'disregarded') {
    return "⋯";
  }
}

export type StreamingFormatter = {
  type: "streaming";
  header(): void;
  event(event: RunResultEvent, config: ProjectOptions): void;
  ci(tree: Record<string, any>): void;
  footer(summary: Summary): void;
};

export type Formatter = StreamingFormatter;
