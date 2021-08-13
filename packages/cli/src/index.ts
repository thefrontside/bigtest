import { CLI } from './cli';
import { main } from 'effection';

import { warnUnexpectedExceptions } from './warn-unexpected-exceptions';

main(warnUnexpectedExceptions(CLI)(process.argv.slice(2)));
