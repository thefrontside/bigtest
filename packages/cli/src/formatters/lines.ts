import * as chalk from 'chalk';
import { Formatter, stepStatusIcon, assertionStatusIcon, standardFooter } from '../format-helpers';

const formatter: Formatter = {
  header() {
    // no op
  },

  event(event) {
    if(event.type === 'step:result' && event.status) {
      console.log(`${stepStatusIcon(event.status)} ${chalk.grey(event.agentId + ':')} ${event.path?.slice(1).join(chalk.grey(' → '))}`);
    }
    if(event.type === 'assertion:result' && event.status) {
      console.log(`${assertionStatusIcon(event.status)} ${chalk.grey(event.agentId + ':')} ${event.path?.slice(1).join(chalk.grey(' → '))}`);
    }
  },

  footer: standardFooter()
};

export default formatter;
