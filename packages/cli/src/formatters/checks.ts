import { FormatterConstructor, statusIcon, standardFooter } from '../format-helpers';

const formatter: FormatterConstructor = () => {
  let didGetResult = false;
  return {
    header() {
      // no op
    },

    event(event) {
      if((event.type === 'step:result' || event.type === 'assertion:result') && event.status) {
        didGetResult = true;
        process.stdout.write(statusIcon(event.status));
      }
      if(event.type === 'testRun:result' && didGetResult) {
        process.stdout.write('\n\n');
      }
    },

    footer: standardFooter()
  }
};

export default formatter;
