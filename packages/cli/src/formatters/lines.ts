import chalk from 'chalk';
import { FormatterConstructor, stepStatusIcon, assertionStatusIcon, printStandardFooter } from '../format-helpers';

const formatter: FormatterConstructor = (printer) => {
  return {
    header() {
      // no op
    },

    event(event) {
      if(event.type === 'step:result' && event.status) {
        printer.words(stepStatusIcon(event.status), chalk.grey(event.agentId + ':'), event.path?.slice(1).join(chalk.grey(' → ')));
      }
      if(event.type === 'assertion:result' && event.status) {
        printer.words(assertionStatusIcon(event.status), chalk.grey(event.agentId + ':'), event.path?.slice(1).join(chalk.grey(' → ')));
      }
    },

    footer(results) {
      printStandardFooter(printer, results);
    }
  }
};

export default formatter;
