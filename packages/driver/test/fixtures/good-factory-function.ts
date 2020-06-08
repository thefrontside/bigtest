import { Operation } from 'effection';
import { Driver, DriverFactory } from '../../index';

export const create: DriverFactory<string, number> = (spec) => {
  return function* createDriver(): Operation<Driver<number>> {
    return {
      description: `Driver<${spec.options}>`,
      data: 42,
      *connect() { return null; }
    }
  }
}
