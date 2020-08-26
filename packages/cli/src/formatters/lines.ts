import * as chalk from 'chalk';
import * as _log from 'ololog';
import { ProjectOptions } from '@bigtest/project';
import { StreamingFormatter, Counts, RunResultEvent, icon, statusIcon } from '../format-helpers';

let log = _log.configure ({ 
  indent: { pattern: '  ' },
  locate: false
});

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

  if (config.showTree) { 
    console.log(result);
  } else {
    process.stdout.write('.');
  }
}

function recursiveChildrenResults(children: object[], level = 0) {
  let indent = 1 + (level * 1);

  children.forEach((child: Record<string, any>) => {
    log.indent(level * 1)(`☲ ${child.description}`);

    child.steps.forEach((step: Record<string, any>) => {
      let icon = step.status === 'failed' ? chalk.red('⨯') : '↪';
      let stepString = `${icon} ${step.description}`;
      log.indent(indent)(stepString);

      if (step.status === 'failed') {
        let errorMessage = `${step.error?.message}`;
        log.indent(indent + 2)(errorMessage);

        let errorStack = `${step.error?.stack}`;
        log.indent(indent + 2).bright.red.error.noLocate(errorStack);
       }
    });

    child.assertions.forEach((assertion: Record<string, any>) => {
      let assertionString = `${statusIcon(assertion.status || '')} ${assertion.description}`;
      log.indent(indent)(assertionString);
    });

    if (child.children?.length) {
      return recursiveChildrenResults(child.children, level + 1);
    }
  });
}

const formatter: StreamingFormatter = {
  type: 'streaming',

  header() {
    // no op
  },

  event(event, config) {
    if(event.type === 'step:result' || event.type === 'assertion:result') {
      formatEvent(event, config);
    }
  },

  ci(tree) {
    let agent = tree.agents[0];
    return recursiveChildrenResults(agent.result.children);
  },

  footer(summary) {
    console.log('');
    console.log(summary.status === 'ok' ? '✓ SUCCESS' : '⨯ FAILURE', `finished in ${((summary.duration)/1000).toFixed(2)}s`);
    console.log(formatFooterCounts('Steps', summary.stepCounts));
    console.log(formatFooterCounts('Assertions', summary.assertionCounts));
  }
}

export default formatter;
