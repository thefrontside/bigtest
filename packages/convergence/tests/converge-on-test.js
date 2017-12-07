import { describe, beforeEach, afterEach, it } from 'mocha';
import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import convergeOn from '../src/converge-on';

use(chaiAsPromised);

describe('BigTest Convergence - convergeOn', () => {
  let total, test, timeout;

  beforeEach(() => {
    total = 0;
    test = (num) => convergeOn(() => {
      expect(total).to.equal(num);
    });
  });

  afterEach(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  it('resolves when the assertion passes', () => {
    total = 5;
    return expect(test(5)).to.be.fulfilled;
  });

  it('rejects when the assertion does not pass', () => {
    return expect(test(5)).to.be.rejected;
  });

  describe('with a specific timeout', () => {
    beforeEach(() => {
      test = (num) => convergeOn(() => {
        expect(total).to.equal(num);
      }, 50);
    });

    it('resolves when the assertion passes within the timeout', () => {
      timeout = setTimeout(() => total = 5, 30);
      return expect(test(5)).to.be.fulfilled;
    });

    it('rejects if the assertion does not pass within the timeout', () => {
      timeout = setTimeout(() => total = 5, 80);
      return expect(test(5)).to.be.rejected;
    });
  });

  describe('when `invert` is true', () => {
    beforeEach(() => {
      total = 5;
      test = (num) => convergeOn(() => {
        expect(total).to.equal(num);
      }, 50, true);
    });

    it('resolves if the assertion does not fail throughout the timeout', () => {
      return expect(test(5)).to.be.fulfilled;
    });

    it('rejects when the assertion fails within the timeout', () => {
      timeout = setTimeout(() => total = 0, 30);
      return expect(test(5)).to.be.rejected;
    });
  });

  describe('when bound to the testing context', () => {
    beforeEach(function() {
      this.convergent = true;
      test = () => convergeOn.call(this, function() {
        expect(this.convergent).to.be.true;
      });
    });

    it('should curry the context to our assertion', () => {
      return expect(test()).to.be.fulfilled;
    });
  });

  describe('when the assertion returns `false`', () => {
    beforeEach(() => {
      test = (num) => convergeOn(() => total >= num, 50);
    });

    it('rejects if `false` was continually returned', () => {
      return expect(test(10)).to.be.rejectedWith('convergent assertion returned `false`');
    });

    it('resolves when `false` is not returned', () => {
      timeout = setTimeout(() => total = 10, 30);
      return expect(test(10)).to.be.fulfilled;
    });

    describe('and `invert` is true', () => {
      beforeEach(() => {
        test = (num) => convergeOn(() => total < num, 50, true);
      });

      it('resolves if `false` was never returned', () => {
        return expect(test(10)).to.be.fulfilled;
      });

      it('rejects when `false` is returned', () => {
        timeout = setTimeout(() => total = 10, 30);
        return expect(test(10)).to.be.rejectedWith('convergent assertion returned `false`');
      });
    });
  });
});
