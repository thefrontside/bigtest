import { describe, beforeEach, afterEach, it } from 'mocha';
import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { convergent } from '../src';

use(chaiAsPromised);

describe('BigTest Converge: convergent', function() {
  let total, test, timeout;

  beforeEach(function() {
    total = 0;
    test = convergent((num) => {
      expect(total).to.equal(num);
    });
  });

  afterEach(function() {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  it('resolves when the assertion passes', function() {
    total = 5;
    return expect(test(5)).to.be.fulfilled;
  });

  it('rejects when the assertion does not pass', function() {
    return expect(test(5)).to.be.rejected;
  });

  describe('with a specific timeout', function() {
    beforeEach(function() {
      test = convergent((num) => {
        expect(total).to.equal(num);
      }, 50);
    });

    it('resolves when the assertion passes within the timeout', function() {
      timeout = setTimeout(() => total = 5, 30);
      return expect(test(5)).to.be.fulfilled;
    });

    it('rejects if the assertion does not pass within the timeout', function() {
      timeout = setTimeout(() => total = 5, 80);
      return expect(test(5)).to.be.rejected;
    });

    it('allows changing the timeout before execution', function() {
      test.timeout = 100;
      timeout = setTimeout(() => total = 5, 80);
      return expect(test(5)).to.be.fulfilled;
    });
  });

  describe('when `invert` is true', function() {
    beforeEach(function() {
      total = 5;
      test = convergent((num) => {
        expect(total).to.equal(num);
      }, 50, true);
    });

    it('resolves if the assertion does not fail throughout the timeout', function() {
      return expect(test(5)).to.be.fulfilled;
    });

    it('rejects when the assertion fails within the timeout', function() {
      timeout = setTimeout(() => total = 0, 30);
      return expect(test(5)).to.be.rejected;
    });
  });

  describe('when bound to the testing context', function() {
    beforeEach(function() {
      this.convergent = true;
      test = convergent(function() {
        expect(this.convergent).to.be.true;
      }).bind(this);
    });

    it('should curry the context to our assertion', function() {
      return expect(test()).to.be.fulfilled;
    });
  });

  describe('when the assertion returns `false`', function() {
    beforeEach(function() {
      test = convergent((num) => total >= num, 50);
    });

    it('should reject if `false` was continually returned', function() {
      return expect(test(10)).to.be.rejectedWith('the assertion returned `false`');
    });

    it('should resolve when `false` is not returned', function() {
      timeout = setTimeout(() => total = 10, 30);
      return expect(test(10)).to.be.fulfilled;
    });

    describe('and `invert` is true', function() {
      beforeEach(function() {
        test = convergent((num) => total < num, 50, true);
      });

      it('should resolve if `false` was never returned', function() {
        return expect(test(10)).to.be.fulfilled;
      });

      it('should reject when `false` is returned', function() {
        timeout = setTimeout(() => total = 10, 30);
        return expect(test(10)).to.be.rejectedWith('the assertion returned `false`');
      });
    });
  });
});
