import * as chalk from 'chalk';
import * as _log from 'ololog';
import { TestResult, StepResult, AssertionResult } from '@bigtest/suite';
import {
  StreamingFormatter,
  Counts,
  RunResultEvent,
  statusIcon,
} from '../format-helpers';

type Agent = {
  agent: {
    agentId: string;
    browser: { name: string };
  };
  result: TestResult;
};

let log = _log.configure({
  indent: { pattern: '  ' },
  locate: false,
});

function formatFooterCounts(label: string, counts: Counts): void {
  log.indent(0)(`\n${label}`);
  log.indent(0)(`${chalk.green(`${counts.ok.toFixed(0)} ok,`)} ${chalk.red(`${counts.failed.toFixed(0)} failed,`)} ${counts.disregarded.toFixed(0)} disregarded`);
}

function formatEvent(event: RunResultEvent) {
  if (!event.error) {
    process.stdout.write(chalk.green('.'));
  } else {
    process.stdout.write(chalk.red('⨯'));
  }
}

function recursiveChildrenResults(
  children: TestResult[],
  agent: Agent['agent'],
  level = 0
) {
  if (level === 0) {
    log.indent(0)('\n-----------------------------------');
    log.indent(0)(agent.browser.name);
    log.indent(0)('-----------------------------------');
  }

  let indent = 1 + level;

  children.forEach((child: TestResult) => {
    // TODO add showTree/verbose check here
    if (child.status !== 'ok') {
      log.indent(level)(`☲ ${child.description}`);

      child.steps.forEach((step: StepResult) => {
        let icon = statusIcon(step.status, '↪');
        let stepString = `${icon} ${step.description}`;
        log.indent(indent)(stepString);

        if (step.status === 'failed') {
          if (step.error) {
            let errorString = ['| ERROR:', step.error.name, step.error.message]
              .filter((e) => e)
              .join(' ');
            if (step.error.stack) {
              for (let stackFrame of step.error.stack) {
                let location = stackFrame.source || stackFrame;
                errorString += `\n| `;
                if (location.fileName) {
                  errorString += `${location.fileName}:${location.line ||
                    0}:${location.column || 0} `;
                }
                if (stackFrame.name) {
                  errorString += `@ ${stackFrame.name}`;
                }
                if (stackFrame.code) {
                  errorString += `\n| > ${stackFrame.code.trim()}`;
                }
              }
            }

            log.indent(indent + 1).bright.red.noLocate(errorString);
          } else {
            log
              .indent(indent + 1)
              .bright.red.error.noLocate(
                'Unknown error occurred: This is likely a bug in BigTest and should be reported at https://github.com/thefrontside/bigtest/issues.'
              );
          }
        }
      });

      child.assertions.forEach((assertion: AssertionResult) => {
        let assertionString = `${statusIcon(
          assertion.status || '',
          chalk.green('✓')
        )} ${assertion.description}`;
        log.indent(indent)(assertionString);
      });
    }

    if (child.children?.length) {
      return recursiveChildrenResults(child.children, agent, level + 1);
    }
  });
}

const formatter: StreamingFormatter = {
  type: 'streaming',

  header() {
    // no op
  },

  event(event) {
    if (event.type === 'step:result' || event.type === 'assertion:result') {
      formatEvent(event);
    }
  },

  ci(tree) {
    tree.agents.forEach((agent: Agent) => {
      recursiveChildrenResults(agent.result.children, agent.agent);
    });
  },

  footer(summary) {
    console.log('');
    console.log(
      summary.status === 'ok'
        ? chalk.green('✓ SUCCESS')
        : chalk.red('⨯ FAILURE'),
      `finished in ${(summary.duration / 1000).toFixed(2)}s`
    );
    formatFooterCounts('Steps', summary.stepCounts);
    formatFooterCounts('Assertions', summary.assertionCounts);
  },
};

export default formatter;
