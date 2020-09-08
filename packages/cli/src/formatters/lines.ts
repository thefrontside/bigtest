import { ProjectOptions } from '@bigtest/project';
import { StreamingFormatter, Counts, RunResultEvent, icon } from '../format-helpers';

function formatFooterCounts(label: string, counts: Counts): string {
  return [
    `${label}:`.padEnd(14),
    `${counts.ok.toFixed(0)} ok`.padEnd(8),
    `${counts.failed.toFixed(0)} failed`.padEnd(12),
    `${counts.disregarded.toFixed(0)} disregarded`
  ].join(' ');
}

function formatEvent(event: RunResultEvent, config: ProjectOptions) {
  let result = `${icon(event)} [${event.type.split(':')[0]}]`.padEnd(14);

  if(event.path) {
    result += ' ' + event.path.slice(1).join(' -> ');
  }

  if(event.error) {
    result += ["\n|    ERROR:", event.error.name, event.error.message].filter(e => e).join(' ');
    if(event.error.stack) {
      for(let stackFrame of event.error.stack) {
        let location = stackFrame.source || stackFrame;
        result += `\n|      `
        if(location.fileName) {
          result += `${location.fileName}:${location.line || 0}:${location.column || 0} `;
        }
        if(stackFrame.name) {
          result += `@ ${stackFrame.name}`;
        }
        if(stackFrame.code) {
          result += `\n|        > ${stackFrame.code.trim()}`
        }
      }
    }
  }

  return config.showTree ? result : '.';
}

const formatter: StreamingFormatter = {
  type: 'streaming',

  header() {
    // no op
  },

  event(event, config) {
    if(event.type === 'step:result' || event.type === 'assertion:result') {
      console.log(formatEvent(event, config));
    }
  },

  footer(summary) {
    console.log('');
    console.log(summary.status === 'ok' ? '✓ SUCCESS' : '⨯ FAILURE', `finished in ${((summary.duration)/1000).toFixed(2)}s`);
    console.log(formatFooterCounts('Steps', summary.stepCounts));
    console.log(formatFooterCounts('Assertions', summary.assertionCounts));
  }
}

export default formatter;
