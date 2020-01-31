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

    it('is thennable', async () => {
      let converge = new Convergence();
      expect(converge).to.respondTo('then');

      let value = await converge.do(() => 'hello');
      expect(value).to.equal('hello');

      await expect(converge.do(() => {
        throw new Error('catch me');
      })).to.be.rejectedWith('catch me');
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

    describe('adding assertions with `.when()`', () => {
      let assertion;

      beforeEach(() => {
        assertion = converge.when(() => {});
      });

      it('creates a new instance', () => {
        expect(assertion).to.be.an.instanceOf(Convergence);
        expect(assertion).to.not.equal(converge);
      });

      it('creates a new queue', () => {
        expect(assertion._queue).to.not.equal(converge._queue);
        expect(assertion._queue).to.have.lengthOf(1);
        expect(converge._queue).to.have.lengthOf(0);
      });

      it('adds the assertion to the new queue', () => {
        let assert = () => {};

        assertion = assertion.when(assert);
        expect(assertion._queue[1]).to.have.property('assertion', assert);
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

      it('creates a new queue', () => {
        expect(assertion._queue).to.not.equal(converge._queue);
        expect(assertion._queue).to.have.lengthOf(1);
        expect(converge._queue).to.have.lengthOf(0);
      });

      it('adds to a new queue with an `always` flag and own timeout', () => {
        let assert = () => {};

        assertion = assertion.always(assert, 200);
        expect(assertion._queue[1]).to.have.property('assertion', assert);
        expect(assertion._queue[1]).to.have.property('always', true);
        expect(assertion._queue[1]).to.have.property('timeout', 200);
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

      it('creates a new queue', () => {
        expect(callback._queue).to.not.equal(converge._queue);
        expect(callback._queue).to.have.lengthOf(1);
        expect(converge._queue).to.have.lengthOf(0);
      });

      it('adds to a new queue with a `callback` property', () => {
        let fn = () => {};

        callback = callback.do(fn);
        expect(callback._queue[1]).to.have.property('callback', fn);
      });
    });

    describe('combining convergences with `.append()`', () => {
      let combined;

      beforeEach(() => {
        combined = converge.append(
          new Convergence().when(() => {})
        );
      });

      it('creates a new instance', () => {
        expect(combined).to.be.an.instanceOf(Convergence);
        expect(combined).to.not.equal(converge);
      });

      it('creates a new queue', () => {
        expect(combined._queue).to.not.equal(converge._queue);
        expect(combined._queue).to.have.lengthOf(1);
        expect(converge._queue).to.have.lengthOf(0);
      });

      it('combines the two queues', () => {
        let fn = () => {};

        combined = combined.append(
          new Convergence().do(fn)
        );

        expect(combined._queue[1]).to.have.property('callback', fn);
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

    describe('after using `.when()`', () => {
      let assertion;

      beforeEach(() => {
        assertion = converge.when(() => expect(total).to.equal(5));
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

      it('retains the instance context', () => {
        assertion = converge.when(function() {
          expect(this).to.equal(assertion);
        });

        return expect(assertion.run()).to.be.fulfilled;
      });

      it('rejects with an error when using an async function', () => {
        expect(converge.when(async () => {}).run()).to.be.rejectedWith(/async/);
      });

      it('rejects with an error when returning a promise', () => {
        expect(converge.when(() => Promise.resolve()).run()).to.be.rejectedWith(/promise/);
      });

      describe('with additional chaining', () => {
        beforeEach(() => {
          assertion = assertion.when(() => expect(total).to.equal(10));
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
        });
      });

      it('retains the instance context', () => {
        assertion = converge.always(function() {
          expect(this).to.equal(assertion);
        });

        return expect(assertion.run()).to.be.fulfilled;
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

      it('rejects with an error when using an async function', () => {
        expect(converge.always(async () => {}).run()).to.be.rejectedWith(/async/);
      });

      it('rejects with an error when returning a promise', () => {
        expect(converge.always(() => Promise.resolve()).run()).to.be.rejectedWith(/promise/);
      });

      describe('with a timeout', () => {
        beforeEach(() => {
          assertion = converge.always(() => {
            expect(total).to.equal(5);
          }, 50);
        });

        it('resolves after the 50ms timeout', async () => {
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

      describe('with additional chaining', () => {
        beforeEach(() => {
          assertion = assertion.do(() => {});
        });

        it('resolves after one-tenth the total timeout', async () => {
          let start = Date.now();
          await expect(assertion.timeout(1000).run()).to.be.fulfilled;
          expect(Date.now() - start).to.be.within(100, 120);
        });

        it('resolves after at minumum 20ms', async () => {
          let start = Date.now();
          await expect(assertion.run()).to.be.fulfilled;
          expect(Date.now() - start).to.be.within(20, 40);
        });
      });
    });

    describe('after using `.do()`', () => {
      let assertion;

      it('triggers the callback before resolving', () => {
        assertion = converge
          .when(() => expect(total).to.equal(5))
          .do(() => total * 100);

        createTimeout(() => total = 5, 50);
        return expect(assertion.run()).to.be.fulfilled
          .and.eventually.have.property('value', 500);
      });

      it('passes the previous return value to the callback', () => {
        assertion = converge
          .when(() => {
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

        assertion = converge
          .when(() => expect(total).to.equal(5))
          .do(() => called = true);

        await expect(assertion.run()).to.be.rejected;
        expect(called).to.be.false;
      });

      it('retains the instance context', () => {
        assertion = converge.do(function() {
          expect(this).to.equal(assertion);
        });

        return expect(assertion.run()).to.be.fulfilled;
      });

      describe('and returning a convergence', () => {
        beforeEach(() => {
          // converge reference can be modified before running
          assertion = converge.do(() => converge);
        });

        it('waits for the convergence to settle', async () => {
          let start = Date.now();
          let done = false;

          converge = converge.when(() => done === true);
          createTimeout(() => done = true, 50);

          await expect(assertion.run()).to.be.fulfilled;
          expect(Date.now() - start).to.be.within(50, 70);
        });

        it('rejects when the convergence does', async () => {
          let start = Date.now();
          let called = false;

          converge = converge.when(() => false);
          assertion = assertion.do(() => called = true);

          await expect(assertion.timeout(50).run()).to.be.rejected;
          expect(Date.now() - start).to.be.within(50, 70);
          expect(called).to.be.false;
        });

        it('gives the final `.always()` the remaining timeout', async () => {
          let start = Date.now();

          converge = converge.always(() => true, 200);
          await expect(assertion.timeout(50).run()).to.be.fulfilled;
          expect(Date.now() - start).to.be.within(50, 70);
        });

        it('curries the resolved value to the next function', () => {
          assertion = assertion
            .when((val) => expect(val).to.equal(1));

          converge = converge.do(() => 1);
          return expect(assertion.run()).to.be.fulfilled
            .and.eventually.have.nested.property('queue[0].value', 1);
        });

        it('rejects after the exceeding the timeout', () => {
          converge = converge.do(() => {
            return new Promise((resolve) => {
              createTimeout(resolve, 60);
            });
          });

          return expect(assertion.timeout(50).run()).to.be
            .rejectedWith('convergence exceeded the 50ms timeout');
        });
      });

      describe('and returning a promise', () => {
        let resolve, reject;

        beforeEach(() => {
          assertion = converge.do(() => {
            // eslint-disable-next-line promise/param-names
            return new Promise((res, rej) => {
              [resolve, reject] = [res, rej];
            });
          });
        });

        it('waits for the promise to settle', async () => {
          let start = Date.now();

          createTimeout(() => resolve(), 60);
          await expect(assertion.run()).to.be.fulfilled;
          expect(Date.now() - start).to.be.within(50, 70);
        });

        it('rejects when the promise does', async () => {
          let start = Date.now();

          createTimeout(() => reject(), 60);
          await expect(assertion.run()).to.be.rejected;
          expect(Date.now() - start).to.be.within(50, 70);
        });

        it('curries the resolved value to the next function', () => {
          assertion = assertion
            .when((val) => expect(val).to.equal(1));

          createTimeout(() => resolve(1), 10);
          return expect(assertion.run()).to.be.fulfilled
            .and.eventually.have.nested.property('queue[0].value', 1);
        });

        it('rejects after the exceeding the timeout', () => {
          createTimeout(() => resolve(), 60);
          return expect(assertion.timeout(50).run()).to.be
            .rejectedWith('convergence exceeded the 50ms timeout');
        });
      });
    });

    describe('after using `.append()`', () => {
      it('runs methods from the other convergence', async () => {
        let called = false;

        let assertion = converge.when(() => expect(total).to.equal(5));
        assertion = assertion.append(converge.do(() => called = true));

        createTimeout(() => total = 5, 50);
        await expect(assertion.run()).to.be.fulfilled;
        expect(called).to.be.true;
      });
    });

    describe('after using various chain methods', () => {
      it('resolves with a combined stats object', async () => {
        let assertion = converge
          .when(() => expect(total).to.equal(5))
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
        expect(stats.queue).to.have.lengthOf(4);
      });

      it('stores and calls the callbacks first-in-first-out', async () => {
        let arr = [];

        let assertion = converge
          .do(() => arr.push('first'))
          .do(() => arr.push('second'));

        await expect(assertion.run()).to.be.fulfilled;
        expect(arr).to.deep.equal(['first', 'second']);
      });

      it('curries previous return values through the stack', async () => {
        await expect(
          converge
            .when(() => true)
            .do(foo => !foo)
            .always(foo => foo.toString())
            // undefined returns curry the value
            .when(foo => {
              expect(foo).to.equal('false');
            })
            .do(foo => {
              expect(foo).to.equal('false');
            })
            .always(foo => {
              expect(foo).to.equal('false');
              return null;
            })
            .do(foo => {
              expect(foo).to.be.null;
            })
        ).to.be.fulfilled;
      });
    });
  });
});
