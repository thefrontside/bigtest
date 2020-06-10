import { DriverFactory } from '@bigtest/driver';

import { Local } from './local';
import { Options } from './web-driver';

export const create: DriverFactory<Options, {}> = (spec) => Local(spec.options);
