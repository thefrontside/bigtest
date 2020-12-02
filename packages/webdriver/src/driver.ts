import { DriverFactory } from '@bigtest/driver';

import { Local } from './local';
import { Remote } from './remote';
import { Options } from './web-driver';

export const create: DriverFactory<Options, {}> = ({options}) => {
  if (options.type === 'local') {
    return Local(options);
  } else {
    return Remote(options);
  }
}
