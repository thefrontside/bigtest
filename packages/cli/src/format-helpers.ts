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
  } else if(event.status === 'ok') {
    return "✓";
  } else if(event.status === 'failed') {
    return "⨯";
  } else if(event.status === 'disregarded') {
    return "⋯";
  }
}

export type StreamingFormatter = {
  type: "streaming";
  header(): void;
  event(event: RunResultEvent, config: ProjectOptions): void;
  footer(summary: Summary): void;
}

export type Formatter = StreamingFormatter;
