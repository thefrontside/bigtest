import { FormatterConstructor, statusIcon, printStandardFooter } from '../format-helpers';
import { ResultStatus } from '@bigtest/suite';

const isComplete = (status: ResultStatus) => status === 'ok' || status === 'failed' || status === 'disregarded';

const formatter: FormatterConstructor = (printer) => {
  let didGetResult = false;
  return {
    header() {
      // no op
    },

    event(event) {
      if((event.type === 'step' || event.type === 'assertion') && event.status && isComplete(event.status)) {
        didGetResult = true;
        printer.write(statusIcon(event.status));
      }
      if(event.type === 'testRun' && event.status && isComplete(event.status) && didGetResult) {
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
