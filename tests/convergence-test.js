import { describe, beforeEach, it } from 'mocha';
import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import convergent from '../lib/convergence';

use(chaiAsPromised);

describe('convergent helper', function() {
  let total, test;

  beforeEach(function() {
    total = 0;
    test = convergent((num) => {
      expect(total).to.equal(num);
    });
  });

  it('resolves when the assertion passes', function() {
    total = 5;
    return expect(test(5)).to.be.fulfilled;
  });

  it('rejects when the assertion does not pass', function() {
    return expect(test(5)).to.be.rejected;
  });

  describe('with a specific timeout', function() {
    let timeout = 200;

    beforeEach(function() {
      test = convergent((num) => {
        expect(total).to.equal(num);
      }, timeout);
    });

    it('resolves when the assertion passes within the timeout', function() {
      setTimeout(() => total = 5, timeout - 100);
      return expect(test(5)).to.be.fulfilled;
    });

    it('rejects if the assertion does not pass within the timeout', function() {
      setTimeout(() => total = 5, timeout + 100);
      return expect(test(5)).to.be.rejected;
    });
  });

  describe('when `invert` is true', function() {
    beforeEach(function() {
      total = 5;
      test = convergent((num) => {
        expect(total).to.equal(num);
      }, 200, true);
    });

    it('resolves if the assertion does not fail throughout the timeout', function() {
      return expect(test(5)).to.be.fulfilled;
    });

    it('rejects when the assertion fails within the timeout', function() {
      setTimeout(() => total = 0, 100);
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
});
