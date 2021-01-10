import chalk from 'chalk';
import { Printer } from './printer';
import { RunResultEvent, TestResults, ResultCounts } from './query'
import { ErrorDetails, ResultStatus, TestResult, StepResult, AssertionResult, LogEvent } from '@bigtest/suite'

export { RunResultEvent, TestResults, ResultSummary, ResultCounts } from './query'

export const UNKNOWN_ERROR = 'Unknown error occurred: This is likely a bug in BigTest and should be reported at https://github.com/thefrontside/bigtest/issues.'

export function formatCounts(counts: ResultCounts): string {
  return [
    chalk.green(`${counts.ok.toFixed(0)} ok,`),
    chalk.red(`${counts.failed.toFixed(0)} failed,`),
    `${counts.disregarded.toFixed(0)} disregarded`,
  ].join(' ');
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

export function printStackTrace(printer: Printer, error: ErrorDetails) {
  if(error.stack) {
    for(let stackFrame of error.stack) {
      let location = stackFrame.source || stackFrame;
      let stackLine = '';
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
      printer.grey.line(stackLine);
      if(stackFrame.code) {
        printer.indent().white.line(stackFrame.code.trim());
      }
    }
  }
}

export function printError(printer: Printer, error?: ErrorDetails) {
  if(error) {
    printer.red.words('ERROR', error.name, error.message);

    printStackTrace(printer.indent(), error);
  } else {
    printer.line(UNKNOWN_ERROR);
  }
}

export function printLogEvent(printer: Printer, event: LogEvent) {
  if(event.type === 'error') {
    printError(printer.prefix(chalk.red('⨯ '), chalk.red('│ ')), event.error);
  } else {
    let color = {
      debug: chalk.grey,
      info: chalk.grey,
      log: chalk.grey,
      warn: chalk.yellow,
      error: chalk.red,
    }[event.message.level];
    printer.prefix(color('⌾ '), color('│ ')).line(color(event.message.text));
  }
}

export function printLog(printer: Printer, events?: LogEvent[]) {
  if(!events) return;
  printer.blue.line(chalk.blue('┌ Console'));

  for(let event of events) {
    printLogEvent(printer.prefix(chalk.blue('│ ')), event);
  }
}

export function printStepResult(printer: Printer, step: StepResult) {
  printer.words(stepStatusIcon(step.status), step.description);

  if(step.status === 'failed') {
    printError(printer.indent().prefix(chalk.red('│ ')), step.error);
    printLog(printer.indent(), step.logEvents);
  }
}

export function printAssertionResult(printer: Printer, assertion: AssertionResult) {
  printer.words(assertionStatusIcon(assertion.status), assertion.description);

  if(assertion.status === 'failed') {
    printError(printer.indent().prefix(chalk.red('│ ')), assertion.error);
    printLog(printer.indent(), assertion.logEvents);
  }
}

export function printResults(printer: Printer, result: TestResult) {
  if(result.status !== 'ok') {
    printer.line(`☲ ${result.description}`);

    result.steps.forEach((step: StepResult) => {
      printStepResult(printer.indent(), step);
    });

    result.assertions.forEach((assertion: AssertionResult) => {
      printAssertionResult(printer.indent(), assertion);
    });

    result.children.forEach((child) => {
      printResults(printer.indent(), child);
    });
  }
}

export function printStandardFooter(printer: Printer, { testRun }: TestResults) {
  testRun.agents.forEach(({ agent, summary, result }) => {
    printer.grey.line('────────────────────────────────────────────────────────────────────────────────');
    printer.line(`${agent.agentId}`);
    printer.line(`Steps:      ${formatCounts(summary.stepCounts)}`);
    printer.line(`Assertions: ${formatCounts(summary.assertionCounts)}`);

    if(result.status !== 'ok') {
      printer.line();
      printResults(printer, result);
    }
  });
  if(testRun.agents.length) {
    printer.grey.line('────────────────────────────────────────────────────────────────────────────────');
  }
  if(testRun.status === 'failed' && testRun.error) {
    printError(printer, testRun.error);
    printer.line();
  }
  if(testRun.status === 'ok') {
    printer.green.line('✓ SUCCESS');
  } else {
    printer.red.line('⨯ FAILURE')
  }
}

export type Formatter = {
  header(): void;
  event(event: RunResultEvent): void;
  footer(result: TestResults): void;
};

export type FormatterConstructor = (printer: Printer) => Formatter;
