import { DriverFactory } from '@bigtest/driver';

import { Local } from './local';
import { Remote } from './remote';
import { Options } from './web-driver';

export const create: DriverFactory<Options, {}> = (spec) => {
  if ('driverUrl' in spec.options) {
    return Remote(spec.options);
  }

  return Local(spec.options);
}
