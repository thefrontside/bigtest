import { Formatter, statusIcon, standardFooter } from '../format-helpers';

const formatter: Formatter = {
  header() {
    // no op
  },

  event(event) {
    if((event.type === 'step:result' || event.type === 'assertion:result') && event.status) {
      process.stdout.write(statusIcon(event.status));
    }
    if(event.type === 'testRun:result') {
      process.stdout.write('\n\n');
    }
  },

  footer: standardFooter()
};

export default formatter;
