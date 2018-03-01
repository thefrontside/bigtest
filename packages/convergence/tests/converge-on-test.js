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

    it('resolves when the assertion passes within the timeout', async () => {
      timeout = setTimeout(() => total = 5, 30);

      let start = Date.now();
      await expect(test(5)).to.be.fulfilled;
      expect(Date.now() - start).to.be.within(30, 50);
    });

    it('rejects if the assertion does not pass within the timeout', async () => {
      timeout = setTimeout(() => total = 5, 80);

      let start = Date.now();
      await expect(test(5)).to.be.rejected;
      expect(Date.now() - start).to.be.lt(50);
    });
  });

  describe('when `always` is true', () => {
    beforeEach(() => {
      total = 5;
      test = (num) => convergeOn(() => {
        expect(total).to.equal(num);
      }, 50, true);
    });

    it('resolves if the assertion does not fail throughout the timeout', async () => {
      let start = Date.now();
      await expect(test(5)).to.be.fulfilled;
      expect(Date.now() - start).to.be.lt(50);
    });

    it('rejects when the assertion fails within the timeout', async () => {
      timeout = setTimeout(() => total = 0, 30);

      let start = Date.now();
      await expect(test(5)).to.be.rejected;
      expect(Date.now() - start).to.be.within(30, 50);
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

    describe('and `always` is true', () => {
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

  describe('when `useStats` is true', () => {
    beforeEach(() => {
      test = (num) => convergeOn(() => {
        return total === num && num * 100;
      }, 50, false, true);
    });

    it('resolves with a stats object', async () => {
      timeout = setTimeout(() => total = 5, 30);

      let start = Date.now();
      let stats = await expect(test(5)).to.be.fulfilled;
      let end = Date.now();

      expect(stats.start).to.be.within(start, start + 1);
      expect(stats.end).to.be.within(end - 1, end);
      expect(stats.elapsed).to.be.within(28, 52);
      expect(stats.runs).to.equal(4);
      expect(stats.always).to.be.false;
      expect(stats.timeout).to.equal(50);
      expect(stats.value).to.equal(500);
    });
  });
});
