import * as chalk from 'chalk';
import { RunResultEvent, TestResults, ResultCounts } from './query'
import { ErrorDetails, ResultStatus, TestResult, StepResult, AssertionResult } from '@bigtest/suite'

export { RunResultEvent, TestResults, ResultSummary, ResultCounts } from './query'

export const UNKNOWN_ERROR = 'Unknown error occurred: This is likely a bug in BigTest and should be reported at https://github.com/thefrontside/bigtest/issues.'

export function formatCounts(counts: ResultCounts): string {
  return `${chalk.green(`${counts.ok.toFixed(0)} ok,`)} ${chalk.red(`${counts.failed.toFixed(0)} failed,`)} ${counts.disregarded.toFixed(0)} disregarded`;
}

export function statusIcon(status: ResultStatus, okayIcon = '✓'): string {
  if(status === 'ok') {
    return chalk.green(okayIcon);
  } else if(status === 'disregarded') {
    return chalk.grey('◦');
  } else {
    return chalk.red('⨯');
  }
}

export const stepStatusIcon = (status: ResultStatus): string => statusIcon(status, '↪');
export const assertionStatusIcon = (status: ResultStatus): string => statusIcon(status, '✓');

export function errorLines(error: ErrorDetails): string[] {
  let title = ['ERROR'];
  if(error.name) {
    title.push(error.name)
  }
  if(error.message) {
    title.push(error.message);
  }
  let errorLines = [title.join(' ')];

  if(error.stack) {
    for(let stackFrame of error.stack) {
      let location = stackFrame.source || stackFrame;
      let stackLine = '  '
      if(location.fileName) {
        stackLine += location.fileName;
      }
      if(location.line) {
        stackLine += `:${location.line}`
        if(location.column) {
          stackLine += `:${location.column}`;
        }
      }
      if(stackFrame.name) {
        stackLine += ` @ ${stackFrame.name}`;
      }
      errorLines.push(stackLine);
      if(stackFrame.code) {
        errorLines.push('  > ' + stackFrame.code.trim());
      }
    }
  }

  return errorLines;
}

function recursiveChildrenResults(result: TestResult, level = 0) {
  let prefix = ' '.repeat(level * 2);
  if(result.status !== 'ok') {
    console.log(prefix + `☲ ${result.description}`);

    result.steps.forEach((step: StepResult) => {
      console.log(prefix + `  ${stepStatusIcon(step.status)} ${step.description}`);

      if(step.status === 'failed') {
        if(step.error) {
          errorLines(step.error).forEach((line) => {
            console.log(chalk.redBright(prefix + '    │ ' + line));
          });
        } else {
          console.log(chalk.redBright(prefix + '    │ ' + UNKNOWN_ERROR));
        }
      }
    });

    result.assertions.forEach((assertion: AssertionResult) => {
      console.log(prefix + `  ${assertionStatusIcon(assertion.status)} ${assertion.description}`);

      if(assertion.status === 'failed') {
        if(assertion.error) {
          errorLines(assertion.error).forEach((line) => {
            console.log(chalk.redBright(prefix + '    │ ' + line));
          });
        } else {
          console.log(chalk.redBright(prefix + '    │ ' + UNKNOWN_ERROR));
        }
      }
    });

    result.children.forEach((child) => {
      recursiveChildrenResults(child, level + 1);
    });
  }
}


export function standardFooter() {
  return function({ testRun }: TestResults) {
    testRun.agents.forEach(({ agent, summary, result }) => {
      console.log(chalk.grey('────────────────────────────────────────────────────────────────────────────────'));
      console.log(`${agent.agentId}`);
      console.log(`Steps:      ${formatCounts(summary.stepCounts)}`);
      console.log(`Assertions: ${formatCounts(summary.assertionCounts)}`);

      if(result.status !== 'ok') {
        console.log('');
        recursiveChildrenResults(result);
      }
    });
    console.log(chalk.grey('────────────────────────────────────────────────────────────────────────────────'));
    console.log(
      testRun.status === 'ok'
        ? chalk.green('✓ SUCCESS')
        : chalk.red('⨯ FAILURE')
    );
  }
}

export type Formatter = {
  header(): void;
  event(event: RunResultEvent): void;
  footer(result: TestResults): void;
};
