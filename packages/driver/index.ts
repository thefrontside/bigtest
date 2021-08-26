import { Operation, Resource } from 'effection';

export interface DriverSpec {
  module: string;
  options?: Record<string, unknown>;
}

export interface Driver<TData = unknown> {
  description: string;
  data: TData;
  connect(agentURL: string): Operation<void>;
}

export interface DriverFactory<TData> {
  (options: Record<string, unknown>): Resource<Driver<TData>>;
}

export function importDriver<TData>(spec: DriverSpec): Resource<Driver<TData>> {
  return {
    *init() {
      try {
        let exports = yield import(spec.module);
        if (typeof exports.create !== 'function') {
          throw new DriverError(`found the driver '${spec.module} at ${require.resolve(spec.module)}, but it must export a 'create' function.
    Instead of a function however, it was found ${exports.create}`);
        }
        let factory = exports.create as DriverFactory<TData>;
        return yield factory(spec.options || {});
      } catch(error) {
        if (error.code === 'MODULE_NOT_FOUND') {
          throw new DriverNotFoundError(spec);
        } else {
          throw error;
        }
      }
    }
  }
}

class DriverNotFoundError extends Error {
  constructor(spec: DriverSpec) {
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
