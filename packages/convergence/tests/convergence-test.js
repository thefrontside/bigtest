import { describe, beforeEach, afterEach, it } from 'mocha';
import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import Convergence from '../src/convergence';

use(chaiAsPromised);

describe('BigTest Convergence', () => {
  describe('creating a new instance', () => {
    it('has a default timeout of 2000ms', () => {
      expect(new Convergence().timeout()).to.equal(2000);
    });

    it('allows initializing with a different timeout', () => {
      expect(new Convergence(50).timeout()).to.equal(50);
    });
  });

  describe('with an existing instance', () => {
    let converge;

    beforeEach(() => {
      converge = new Convergence();
    });

    describe('setting a new timeout', () => {
      let quick;

      beforeEach(() => {
        quick = converge.timeout(50);
      });

      it('creates a new instance', () => {
        expect(quick).to.be.an.instanceOf(Convergence);
        expect(quick).to.not.equal(converge);
      });

      it('has a new timeout', () => {
        expect(quick.timeout()).to.equal(50);
        expect(converge.timeout()).to.equal(2000);
      });
    });

    describe('adding assertions with `.and()`', () => {
      let assertion;

      beforeEach(() => {
        assertion = converge.and(() => {});
      });

      it('creates a new instance', () => {
        expect(assertion).to.be.an.instanceOf(Convergence);
        expect(assertion).to.not.equal(converge);
      });

      it('creates a new stack', () => {
        expect(assertion._stack).to.not.equal(converge._stack);
        expect(assertion._stack).to.have.lengthOf(1);
        expect(converge._stack).to.have.lengthOf(0);
      });

      it('adds the assertion to the new stack', () => {
        let assert = () => {};

        assertion = assertion.and(assert);
        expect(assertion._stack[1]).to.have.property('assert', assert);
      });
    });

    describe('adding assertions with `.still()`', () => {
      let assertion;

      beforeEach(() => {
        assertion = converge.still(() => {});
      });

      it('creates a new instance', () => {
        expect(assertion).to.be.an.instanceOf(Convergence);
        expect(assertion).to.not.equal(converge);
      });

      it('creates a new stack', () => {
        expect(assertion._stack).to.not.equal(converge._stack);
        expect(assertion._stack).to.have.lengthOf(1);
        expect(converge._stack).to.have.lengthOf(0);
      });

      it('adds to a new stack with an `invert` flag and own timeout', () => {
        let assert = () => {};

        assertion = assertion.still(assert);
        expect(assertion._stack[1]).to.have.property('assert', assert);
        expect(assertion._stack[1]).to.have.property('invert', true);
        expect(assertion._stack[1]).to.have.property('timeout', 200);
      });

      it('should be able to customize own timeout', () => {
        assertion = assertion.still(() => {}, 50);
        expect(assertion._stack[1]).to.have.property('timeout', 50);
      });
    });

    describe('adding callbacks with `.tap()`', () => {
      let tapped;

      beforeEach(() => {
        tapped = converge.tap(() => {});
      });

      it('creates a new instance', () => {
        expect(tapped).to.be.an.instanceOf(Convergence);
        expect(tapped).to.not.equal(converge);
      });

      it('creates a new stack', () => {
        expect(tapped._stack).to.not.equal(converge._stack);
        expect(tapped._stack).to.have.lengthOf(1);
        expect(converge._stack).to.have.lengthOf(0);
      });

      it('adds to a new stack with an `exec` property', () => {
        let callback = () => {};

        tapped = tapped.tap(callback);
        expect(tapped._stack[1]).to.have.property('exec', callback);
      });
    });
  });

  describe('running convergences', () => {
    let total, converge, timeouts;
    let createTimeout = (...args) => {
      timeouts.push(setTimeout(...args));
    };

    beforeEach(() => {
      total = 0;
      converge = new Convergence(100);
      timeouts = [];
    });

    afterEach(() => {
      timeouts.forEach((timeout) => {
        clearTimeout(timeout);
      });
    });

    it('returns a promise', () => {
      expect(converge.run()).to.be.an.instanceOf(Promise);
    });

    it('should be fulfilled when there are no assertions', () => {
      return expect(converge.run()).to.be.fulfilled;
    });

    describe('after using `.add()`', () => {
      let assertion;

      beforeEach(() => {
        assertion = converge.and(() => expect(total).to.equal(5));
      });

      it('resolves after assertions converge', async () => {
        let start = Date.now();

        createTimeout(() => total = 5, 30);
        await expect(assertion.run()).to.be.fulfilled;
        expect(Date.now() - start).to.be.within(30, 50);
      });

      it('rejects when an assertion is not met', () => {
        return expect(assertion.run()).to.be.rejected;
      });

      describe('with additional chaining', () => {
        beforeEach(() => {
          assertion = assertion.and(() => expect(total).to.equal(10));
        });

        it('resolves after at all assertions are met', async () => {
          let start = Date.now();

          createTimeout(() => total = 5, 30);
          createTimeout(() => total = 10, 50);
          await expect(assertion.run()).to.be.fulfilled;
          expect(Date.now() - start).to.be.within(50, 70);
        });

        it('rejects if assertions are not met in order', () => {
          createTimeout(() => total = 10, 30);
          createTimeout(() => total = 5, 50);
          return expect(assertion.run()).to.be.rejected;
        });
      });
    });

    describe('after using `.still()`', () => {
      let assertion;

      beforeEach(() => {
        total = 5;
        assertion = converge.still(() => {
          expect(total).to.equal(5);
        }, 50);
      });

      it('resolves just before the 100ms timeout', async () => {
        let start = Date.now();
        await expect(assertion.run()).to.be.fulfilled;
        expect(Date.now() - start).to.be.within(80, 100);
      });

      it('rejects when the assertion fails', () => {
        createTimeout(() => total = 10, 50);
        return expect(assertion.run()).to.be.rejected;
      });

      describe('with additional chaining', () => {
        beforeEach(() => {
          assertion = assertion
            .tap(() => total = 10)
            .and(() => expect(total).to.equal(10));
        });

        it('resolves after at least 50ms', async () => {
          let start = Date.now();
          await expect(assertion.run()).to.be.fulfilled;
          expect(Date.now() - start).to.be.within(30, 50);
        });

        it('rejects if the assertion fails within 50ms', () => {
          createTimeout(() => total = 10, 30);
          return expect(assertion.run()).to.be.rejected;
        });
      });
    });

    describe('after using `.tap()`', () => {
      it('triggers the callback before resolving', () => {
        let assertion = converge
          .and(() => expect(total).to.equal(5))
          .tap(() => total * 100);

        createTimeout(() => total = 5, 50);
        return expect(assertion.run()).to.be.fulfilled
          .and.eventually.equal(500);
      });

      it('passes the previous return value to the callback', () => {
        let assertion = converge
          .and(() => {
            expect(total).to.equal(5);
            return total * 100;
          })
          .tap((n) => n / 20);

        createTimeout(() => total = 5, 50);
        return expect(assertion.run()).to.be.fulfilled
          .and.eventually.equal(25);
      });

      it('is not called when a previous assertion fails', async () => {
        let called = false;

        let assertion = converge
          .and(() => expect(total).to.equal(5))
          .tap(() => called = true);

        await expect(assertion.run()).to.be.rejected;
        expect(called).to.be.false;
      });
    });
  });
});
