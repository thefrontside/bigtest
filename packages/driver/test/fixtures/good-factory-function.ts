import { DriverFactory } from '../../index';

type Options = {
  name: string;
}

export const create: DriverFactory<number> = (spec) => {
  let options = spec as Options;
  return {
    *init() {
      return {
        description: `Driver<${options.name}>`,
        data: 42,
        async connect() {}
      }
    }
  }
}
