import { ProjectOptions } from '@bigtest/project';
import { StreamingFormatter, Counts, RunResultEvent, icon, statusIcon } from '../format-helpers';

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

function recursiveChildrenResults(children: object[], level = 0) {
  let returnString = '';
  let indent = 2+ (level * 2);

  children.forEach((child: Record<string, any>) => {
    let descriptionMaxLength = child.description.length + indent;
    returnString += `🧪${child.description}\n`.padStart(descriptionMaxLength);

    child.steps.forEach((step: Record<string, any>) => {
      let stepString = `↪ ${step.description}\n`;
      let maxLength = stepString.length + indent;
      returnString += stepString.padStart(maxLength);

      if (step.status === 'failed') {
        let errorMessage = `${step.error?.message}\n`;
        let errorMessageMaxLength = errorMessage.length + indent + 2;
        returnString += `${errorMessage}`.padStart(errorMessageMaxLength);

        let errorStack = `${step.error?.stack}\n`;
        let errorStackMaxLength = errorStack.length + indent + 2;
        returnString += `${errorStack}`.padStart(errorStackMaxLength);
       }
    });

    child.assertions.forEach((assertion: Record<string, any>) => {
      let assertionString = `${statusIcon(assertion.status || '')} ${assertion.description}\n`
      let maxLength = assertionString.length + indent;
      returnString += assertionString.padStart(maxLength);
    });

    if (child.children?.length) {
      returnString += recursiveChildrenResults(child.children, level + 1);
    }
  });

  return returnString;
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

  ci(tree) {
    let agent = tree.agents[0];
    let returnString = recursiveChildrenResults(agent.result.children);
    console.log(returnString);
  },

  footer(summary) {
    console.log('');
    console.log(summary.status === 'ok' ? '✓ SUCCESS' : '⨯ FAILURE', `finished in ${((summary.duration)/1000).toFixed(2)}s`);
    console.log(formatFooterCounts('Steps', summary.stepCounts));
    console.log(formatFooterCounts('Assertions', summary.assertionCounts));
  }
}

export default formatter;
