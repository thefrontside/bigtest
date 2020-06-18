import { Operation } from 'effection';

export interface DriverSpec<TOptions = unknown> {
  module: string;
  options: TOptions;
}

export interface Driver<TData = unknown> {
  description: string;
  data: TData;
  connect(agentURL: string): Operation<unknown>;
}

export interface DriverFactory<TOptions, TData> {
  (spec: DriverSpec<TOptions>): Operation<Driver<TData>>;
}

export function * load<TOptions, TData>(spec: DriverSpec<TOptions>): Operation<Driver<TData>> {
  try {
    let exports = yield import(spec.module);
    if (typeof exports.create !== 'function') {
      throw new DriverError(`found the driver '${spec.module} at ${require.resolve(spec.module)}, but it must export a 'create' function.
Instead of a function however, it was found ${exports.create}`);
    }
    let factory: DriverFactory<TOptions, TData> = exports.create;
    return yield factory(spec);
  } catch(error) {
    if (error.code === 'MODULE_NOT_FOUND') {
      throw new DriverNotFoundError(spec);
    } else {
      throw error;
    }
  }
}

class DriverNotFoundError extends Error {
  constructor(spec: DriverSpec<unknown>) {
    super(`couldn't find the driver with the module: ${spec.module}. You may have to add it to your project dev dependencies`);
    this.name = 'DriverNotFoundError';
  }
}

class DriverError extends Error {
  constructor(msg: string) {
    super(msg);
    this.name = 'DriverError';
  }
}
