import type { EmptyObject } from '@bigtest/globals';
import { DriverFactory } from '@bigtest/driver';
import { Local } from './local';
import { Remote } from './remote';
import { Options } from './web-driver';


export const create: DriverFactory<Options, EmptyObject> = ({ options }) => {
  if (options.type === 'remote') {
    return Remote(options);
  } else {
    return Local(options);
  }
};
