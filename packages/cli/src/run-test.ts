import { ProjectOptions } from '@bigtest/project';
import { Client } from '@bigtest/server';
import * as query from './query';

function icon(event: query.RunResultEvent) {
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

function filterStack(text: string): string {
  return text.split('\n').filter((l) => !l.match(/__bigtest/)).join('\n');
}

function prefixLines(text: string, prefix: string) {
  return text
    .split('\n')
    .map((l) => prefix + l)
    .join('\n')
}

function formatEvent(event: query.RunResultEvent) {
  let result = `${icon(event)} [${event.type.split(':')[0]}]`.padEnd(14);
  if(event.path) {
    result += ' ' + event.path.slice(1).join(' -> ');
  }
  if(event.error) {
    result += '\n' + prefixLines(event.error.stack ? filterStack(event.error.stack) : `Error: ${event.error.message}`, '|   ')
  }
  return result;
}

export function* runTest(config: ProjectOptions) {
  let client: Client = yield Client.create(`ws://localhost:${config.port}`);

  let subscription = yield client.subscription(query.run());

  while(true) {
    let result: query.RunResult = yield subscription.receive();
    if(query.isDoneResult(result)) {
      return;
    } else if(result.event) {
      if(result.event.type === 'step:result' || result.event.type === 'assertion:result') {
        console.log(formatEvent(result.event))
      }
    }
  }
}

