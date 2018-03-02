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

  describe('extending convergences', () => {
    let custom;

    class CustomConvergence extends Convergence {
      constructor(options = {}, prev = {}) {
        super(options, prev);

        Object.defineProperty(this, 'test', {
          value: options.test || prev.test
        });
      }

      setTest(test) {
        return new this.constructor({ test }, this);
      }
    }

    beforeEach(() => {
      custom = new CustomConvergence({ test: 'a' });
    });

    it('returns the custom instance', () => {
      expect(custom).to.be.an.instanceOf(CustomConvergence);
      expect(custom).to.be.an.instanceOf(Convergence);
      expect(custom).to.have.property('test', 'a');
    });

    it('has custom immutable methods', () => {
      let next = custom.setTest('b');

      expect(next).to.be.an.instanceOf(CustomConvergence);
      expect(next).to.not.equal(custom);
      expect(next.test).to.equal('b');
      expect(custom.test).to.equal('a');
    });

    it('existing methods return a custom instance', () => {
      let next = custom.timeout(100);

      expect(next).to.be.an.instanceOf(CustomConvergence);
      expect(next).to.not.equal(custom);
      expect(next.test).to.equal(custom.test);
    });

    it('preserves properties across instances', () => {
      let next = custom.timeout(100);

      expect(next.timeout()).to.equal(100);
      expect(next).to.have.property('test', 'a');

      next = next.setTest('c');
      expect(next.timeout()).to.equal(100);
      expect(next.test).to.equal('c');
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

    describe('adding assertions with `.once()`', () => {
      let assertion;

      beforeEach(() => {
        assertion = converge.once(() => {});
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

        assertion = assertion.once(assert);
        expect(assertion._stack[1]).to.have.property('assert', assert);
      });
    });

    describe('adding assertions with `.always()`', () => {
      let assertion;

      beforeEach(() => {
        assertion = converge.always(() => {});
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

      it('adds to a new stack with an `always` flag and own timeout', () => {
        let assert = () => {};

        assertion = assertion.always(assert);
        expect(assertion._stack[1]).to.have.property('assert', assert);
        expect(assertion._stack[1]).to.have.property('always', true);
        expect(assertion._stack[1]).to.have.property('timeout', 200);
      });

      it('should be able to customize own timeout', () => {
        assertion = assertion.always(() => {}, 50);
        expect(assertion._stack[1]).to.have.property('timeout', 50);
      });
    });

    describe('adding callbacks with `.do()`', () => {
      let callback;

      beforeEach(() => {
        callback = converge.do(() => {});
      });

      it('creates a new instance', () => {
        expect(callback).to.be.an.instanceOf(Convergence);
        expect(callback).to.not.equal(converge);
      });

      it('creates a new stack', () => {
        expect(callback._stack).to.not.equal(converge._stack);
        expect(callback._stack).to.have.lengthOf(1);
        expect(converge._stack).to.have.lengthOf(0);
      });

      it('adds to a new stack with an `exec` property', () => {
        let fn = () => {};

        callback = callback.do(fn);
        expect(callback._stack[1]).to.have.property('exec', fn);
      });
    });

    describe('combining convergences with `.append()`', () => {
      let combined;

      beforeEach(() => {
        combined = converge.append(
          new Convergence().once(() => {})
        );
      });

      it('creates a new instance', () => {
        expect(combined).to.be.an.instanceOf(Convergence);
        expect(combined).to.not.equal(converge);
      });

      it('creates a new stack', () => {
        expect(combined._stack).to.not.equal(converge._stack);
        expect(combined._stack).to.have.lengthOf(1);
        expect(converge._stack).to.have.lengthOf(0);
      });

      it('combines the two stacks', () => {
        let fn = () => {};

        combined = combined.append(
          new Convergence().do(fn)
        );

        expect(combined._stack[1]).to.have.property('exec', fn);
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

    describe('after using `.once()`', () => {
      let assertion;

      beforeEach(() => {
        assertion = converge.once(() => expect(total).to.equal(5));
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
          assertion = assertion.once(() => expect(total).to.equal(10));
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

    describe('after using `.always()`', () => {
      let assertion;

      beforeEach(() => {
        total = 5;
        assertion = converge.always(() => {
          expect(total).to.equal(5);
        }, 50);
      });

      it('resolves after the 100ms timeout', async () => {
        let start = Date.now();
        await expect(assertion.run()).to.be.fulfilled;
        expect(Date.now() - start).to.be.within(100, 120);
      });

      it('rejects when the assertion fails', async () => {
        createTimeout(() => total = 10, 50);

        let start = Date.now();
        await expect(assertion.run()).to.be.rejected;
        expect(Date.now() - start).to.be.within(50, 70);
      });

      describe('with additional chaining', () => {
        beforeEach(() => {
          assertion = assertion
            .do(() => total = 10)
            .once(() => expect(total).to.equal(10));
        });

        it('resolves after at least 50ms', async () => {
          let start = Date.now();
          await expect(assertion.run()).to.be.fulfilled;
          expect(Date.now() - start).to.be.within(50, 70);
        });

        it('rejects if the assertion fails within 50ms', async () => {
          createTimeout(() => total = 10, 30);

          let start = Date.now();
          await expect(assertion.run()).to.be.rejected;
          expect(Date.now() - start).to.be.within(30, 50);
        });
      });
    });

    describe('after using `.do()`', () => {
      it('triggers the callback before resolving', () => {
        let assertion = converge
          .once(() => expect(total).to.equal(5))
          .do(() => total * 100);

        createTimeout(() => total = 5, 50);
        return expect(assertion.run()).to.be.fulfilled
          .and.eventually.have.property('value', 500);
      });

      it('passes the previous return value to the callback', () => {
        let assertion = converge
          .once(() => {
            expect(total).to.equal(5);
            return total * 100;
          })
          .do((n) => n / 20);

        createTimeout(() => total = 5, 50);
        return expect(assertion.run()).to.be.fulfilled
          .and.eventually.have.property('value', 25);
      });

      it('is not called when a previous assertion fails', async () => {
        let called = false;

        let assertion = converge
          .once(() => expect(total).to.equal(5))
          .do(() => called = true);

        await expect(assertion.run()).to.be.rejected;
        expect(called).to.be.false;
      });
    });

    describe('after using `.append()`', () => {
      it('runs methods from the other convergence', async () => {
        let called = false;

        let assertion = converge.once(() => expect(total).to.equal(5));
        assertion = assertion.append(converge.do(() => called = true));

        createTimeout(() => total = 5, 50);
        await expect(assertion.run()).to.be.fulfilled;
        expect(called).to.be.true;
      });
    });

    describe('after using various chain methods', () => {
      it('resolves with a combined stats object', async () => {
        let assertion = converge
          .once(() => expect(total).to.equal(5))
          .do(() => total = 10)
          .always(() => expect(total).to.equal(10))
          .do(() => total * 5);

        createTimeout(() => total = 5, 50);

        let start = Date.now();
        let stats = await assertion.run();
        let end = Date.now();

        expect(stats.start).to.be.within(start, start + 1);
        expect(stats.end).to.be.within(end - 1, end);
        expect(stats.elapsed).to.be.within(70, 90);
        expect(stats.runs).to.be.within(8, 12);
        expect(stats.timeout).to.equal(100);
        expect(stats.value).to.equal(50);
        expect(stats.stack).to.have.lengthOf(4);
      });
    });
  });
});
