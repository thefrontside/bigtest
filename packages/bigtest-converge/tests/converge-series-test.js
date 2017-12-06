import { describe, beforeEach, afterEach, it } from 'mocha';
import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { convergent, convergeSeries } from '../src';

use(chaiAsPromised);

describe('BigTest Converge: convergeSeries', function() {
  let total, timeouts = [];

  let createTimeout = (fn, timeout) => {
    timeouts.push(setTimeout(fn, timeout));
  };

  beforeEach(function() {
    total = 0;
  });

  afterEach(function() {
    timeouts.forEach((timeout) => {
      clearTimeout(timeout);
    });
  });

  it('should resolve after each convergence, in order', function() {
    createTimeout(() => total = 5, 30);
    createTimeout(() => total = 10, 50);

    return expect(convergeSeries([
      convergent(() => expect(total).to.equal(5)),
      convergent(() => expect(total).to.equal(10))
    ])).to.be.fulfilled;
  });

  it('should reject when a convergence is not met within the timeout', function() {
    createTimeout(() => total = 5, 30);
    createTimeout(() => total = 10, 80);

    return expect(convergeSeries([
      convergent(() => expect(total).to.equal(5)),
      convergent(() => expect(total).to.equal(10))
    ], 50)).to.be.rejected;
  });

  it('should chain functions in the series', function() {
    createTimeout(() => total = 5, 30);
    createTimeout(() => total = 500, 50);

    return expect(convergeSeries([
      convergent(() => expect(total).to.equal(5)),
      () => total * 100,
      convergent((n) => expect(total).to.equal(n))
    ])).to.be.fulfilled;
  });
});
