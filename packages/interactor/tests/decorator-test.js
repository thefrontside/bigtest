/* global describe, beforeEach, afterEach, it */
import { expect } from 'chai';
import Interactor, { interactor } from '../src';

describe('BigTest Interaction: decorator', () => {
  let TestInteractor;

  beforeEach(() => {
    TestInteractor = @interactor class TestInteractor {
      foo = 'bar';

      test = {
        enumerable: false,
        configurable: false,
        value() {}
      };

      nested = new Interactor();

      get getter() {
        return 'got';
      }
    };
  });

  it('retains the class name', () => {
    expect(TestInteractor.name).to.equal('TestInteractor');
  });

  it('extends the interactor class', () => {
    expect(new TestInteractor()).to.be.an.instanceof(Interactor);
  });

  it('sets instance initializers on the prototype', () => {
    expect(TestInteractor.prototype).to.have.property('foo', 'bar');
    expect(new TestInteractor()).to.have.property('foo', 'bar');
  });

  it('preserves property descriptors', () => {
    expect(TestInteractor.prototype).to.have.property('getter', 'got');
    expect(new TestInteractor()).to.have.property('getter', 'got');
  });

  it('uses descriptors from instance initializers', () => {
    expect(TestInteractor.prototype).to.respondTo('test');
    expect(new TestInteractor()).to.respondTo('test');
  });

  it('attaches a parent to nested interactors', () => {
    expect(new TestInteractor().nested).to.be.an.instanceOf(Interactor);
    expect(new TestInteractor().nested).to.not.be.an.instanceOf(TestInteractor);
    expect(new TestInteractor().nested)
      .to.have.property('__parent__').that.is.an.instanceOf(TestInteractor);
  });

  it('nested interactor methods return parent instances', () => {
    expect(new TestInteractor().nested.do(() => {})).to.be.an.instanceOf(TestInteractor);
  });

  it('throws an error when attempting to redefine reserved properties', () => {
    let reserved = [
      'when',
      'always',
      'do',
      'timeout',
      'run',
      'then',
      'append',
      'only'
    ];

    for (let name of reserved) {
      expect(() => interactor(class { [name]() {} }))
        .to.throw(`"${name}" is a reserved property name`);
    }
  });

  describe('with a plain object', () => {
    beforeEach(() => {
      let stub = (...args) => {
        (stub.calls = (stub.calls || [])).push(args);
      };

      stub.og = console.warn;
      console.warn = stub;

      TestInteractor = interactor({
        foo: 'bar',

        test: {
          enumerable: false,
          configurable: false,
          value: () => 'test'
        },

        get getter() {
          return 'got';
        },

        nested: new Interactor()
      });
    });

    afterEach(() => {
      console.warn = console.warn.og;
    });

    it('raises a deprication warning', () => {
      expect(console.warn.calls).to.have.lengthOf(1);
      expect(console.warn.calls[0][0]).to.include('Deprecated');
    });

    it('returns an interactor class with the specified properties', () => {
      expect(new TestInteractor()).to.have.property('foo', 'bar');
      expect(new TestInteractor()).to.have.property('getter', 'got');
      expect(new TestInteractor()).to.respondTo('test');
      expect(new TestInteractor().nested).to.be.an.instanceOf(Interactor)
        .that.has.property('__parent__').that.is.an.instanceOf(TestInteractor);
    });
  });
});
