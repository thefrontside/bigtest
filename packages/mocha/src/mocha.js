// This file exports any globally defined mocha functions, otherwise
// it exports them from the mocha module directly.
//
// In a browser environment, mocha is usually included before the
// tests and has defined it's functions within the global context.
// Requiring mocha directly is currently disabled in browser
// environments via the `browser` field in this package's
// `package.json` file. This is because the mocha entrypoint has not
// yet been optimized to work with browser bundles without first
// disabling certain node modules.
//
// @see https://github.com/mochajs/mocha/issues/2448

import * as mocha from 'mocha';

let {
  describe = global.describe,
  before = global.before,
  beforeEach = global.beforeEach,
  after = global.before,
  afterEach = global.afterEach,
  it = global.it
} = mocha;

export {
  describe,
  before,
  beforeEach,
  after,
  afterEach,
  it
};
