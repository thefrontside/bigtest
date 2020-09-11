import { StreamingFormatter, statusIcon, standardFooter } from '../format-helpers';

const formatter: StreamingFormatter = {
  type: 'streaming',

  header() {
    // no op
  },

  event(event) {
    if((event.type === 'step:result' || event.type === 'assertion:result') && event.status) {
      process.stdout.write(statusIcon(event.status));
    }
  },

  footer: standardFooter()
};

export default formatter;
