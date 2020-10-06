import { FormatterConstructor, statusIcon, printStandardFooter } from '../format-helpers';

const formatter: FormatterConstructor = (printer) => {
  let didGetResult = false;
  return {
    header() {
      // no op
    },

    event(event) {
      if((event.type === 'step:result' || event.type === 'assertion:result') && event.status) {
        didGetResult = true;
        printer.write(statusIcon(event.status));
      }
      if(event.type === 'testRun:result' && didGetResult) {
        printer.line();
        printer.line();
      }
    },

    footer(results) {
      printStandardFooter(printer, results);
    }
  }
};

export default formatter;
