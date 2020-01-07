/* global describe, beforeEach, it */
import { expect } from 'chai';
import Convergence from '@bigtest/convergence';
import { useFixture } from './helpers';
import Interactor from '../src/interactor';

describe('BigTest Interaction: Interactor', () => {
  let instance;

  beforeEach(() => {
    instance = new Interactor();
  });

  it('creates a new instance', () => {
    expect(instance).to.be.an.instanceOf(Interactor);
  });

  it('extends the convergence class', () => {
    expect(instance).to.be.an.instanceOf(Convergence);
  });

  it('has a deprecated `pause` method', () => {
    let warning = null;
    let ogwarn = console.warn;
    console.warn = msg => warning = msg;

    expect(instance).to.respondTo('pause');
    expect(instance.pause()).to.be.an.instanceOf(Interactor);
    expect(instance.pause()).to.not.equal(instance);
    expect(warning).to.match(/deprecated/);

    console.warn = ogwarn;
  });

  describe('with a scope', () => {
    useFixture('scoped-fixture');

    it('has a default scope', () => {
      expect(instance.$root).to.equal(document.body);
    });

    it('can be scoped by selector', () => {
      let scoped = new Interactor('#scoped');

      expect(scoped.$root).to.not.equal(document.body);
      expect(scoped.$root.id).to.equal('scoped');
    });

    it('can be scoped by element', () => {
      let $scope = document.getElementById('scoped');
      let scoped = new Interactor($scope);

      expect(scoped.$root).to.not.equal(document.body);
      expect(scoped.$root).to.equal($scope);
    });

    it('retains the correct nested scopes', () => {
      let scoped = new Interactor().scoped('#scoped').scoped('.test-p');
      expect(scoped).to.have.property('text', 'Scoped');
    });

    it('throws when scope does not exist', () => {
      let scoped = new Interactor('#not-scoped').timeout(50);
      expect(() => scoped.$root).to.throw('unable to find "#not-scoped"');
    });

    it('throws when the selector is invalid', () => {
      let scoped = new Interactor('.#not-valid').timeout(50);

      expect(() => scoped.$root).to.throw(
        SyntaxError,
        '".#not-valid" is not a valid selector'
      );
    });

    it('can have an evaulated scope', () => {
      let scopeID;
      let scoped = new Interactor(() => `#${scopeID}`);

      scopeID = 'scoped';
      expect(scoped.$root.id).to.equal('scoped');

      scopeID = 'not-scoped';
      expect(() => scoped.$root).to.throw('unable to find "#not-scoped"');
    });

    describe('and a custom default scope', () => {
      class ScopedInteractor extends Interactor {}
      Object.defineProperty(ScopedInteractor, 'defaultScope', { value: '#scoped' });

      it('uses the custom default scope', () => {
        let scoped = new ScopedInteractor();

        expect(scoped.$root).to.not.equal(document.body);
        expect(scoped.$root.id).to.equal('scoped');
      });

      it('can still override the scope', () => {
        let scoped = new ScopedInteractor(document.body);
        expect(scoped.$root).to.equal(document.body);
      });
    });
  });

  describe('nesting', () => {
    let parent;

    class ParentInteractor extends Interactor {
      get child() {
        return new ChildInteractor({ parent: this });
      }
    }

    class ChildInteractor extends Interactor {
      test1() { return this.do(() => {}); }
      test2() { return this.test1().test1(); }
      test3() { return instance; }

      deep() {
        return new DeepInteractor({ parent: this });
      }

      test4() { return this.deep().test().deep().test(); }
    }

    class DeepInteractor extends Interactor {
      test() { return this.do(() => {}); }
    }

    beforeEach(() => {
      parent = new ParentInteractor();
    });

    it('returns an instance of the child interactor', () => {
      expect(parent.child).to.be.an.instanceof(ChildInteractor);
      expect(parent.child.deep()).to.be.an.instanceof(DeepInteractor);
    });

    it('returns a new parent instance from nested methods', () => {
      expect(parent.child.test1()).to.be.an.instanceof(ParentInteractor);
      expect(parent.child.test2()).to.be.an.instanceof(ParentInteractor);
      expect(parent.child.deep().test()).to.be.an.instanceof(ParentInteractor);
      expect(parent.child.test4()).to.be.an.instanceof(ParentInteractor);
    });

    it('appends child interactions to the parent instance queue', () => {
      expect(parent.child.test1().child.test2().child.deep().test())
        .to.have.property('_queue').with.a.lengthOf(4);
    });

    it('does not return a new parent when a new child is not returned', () => {
      expect(parent.child.test3()).to.not.be.an.instanceof(ChildInteractor);
      expect(parent.child.test3()).to.not.be.an.instanceof(ParentInteractor);
    });
  });

  describe('DOM helpers', () => {
    useFixture('find-fixture');

    it('has a helper for finding a single DOM element', () => {
      expect(new Interactor().$('.test-p')).to.be.an.instanceOf(Element);
      expect(new Interactor('.test-p').$()).to.be.an.instanceOf(Element);
    });

    it('throws when finding a single element that does not exist', () => {
      expect(() => new Interactor().$('.non-existent'))
        .to.throw('unable to find ".non-existent"');
    });

    it('has a helper for finding multiple DOM elements', () => {
      expect(new Interactor().$$('.test-p')).to.have.lengthOf(2);
      expect(new Interactor('.test-p').$$()).to.have.lengthOf(0);
    });
  });

  describe('from an object', () => {
    let TestInteractor, ExtendedInteractor;

    beforeEach(() => {
      TestInteractor = Interactor.from({
        static: {
          name: 'TestInteractor',
          defaultScope: '.test'
        },

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

      ExtendedInteractor = TestInteractor.from({
        bar: 'baz'
      });
    });

    it('uses static properties for static members', () => {
      expect(TestInteractor.name).to.equal('TestInteractor');
      expect(TestInteractor.defaultScope).to.equal('.test');
    });

    it('returns an interactor class with the specified properties', () => {
      expect(new TestInteractor()).to.have.property('foo', 'bar');
      expect(new TestInteractor()).to.have.property('getter', 'got');
      expect(new TestInteractor()).to.respondTo('test');
      expect(new TestInteractor().nested).to.be.an.instanceOf(Interactor)
        .that.has.property('__parent__').that.is.an.instanceOf(TestInteractor);
    });

    it('extends the origin class', () => {
      expect(new ExtendedInteractor()).to.have.property('bar', 'baz');
      expect(new ExtendedInteractor()).to.be.an.instanceOf(TestInteractor);
    });
  });

  describe('extend a class', () => {
    let TestInteractor, ExtendedInteractor;

    beforeEach(() => {
      TestInteractor = @Interactor.extend class TestInteractor {
        static defaultScope = '.test';
        foo = 'bar';

        test = {
          enumerable: false,
          configurable: false,
          value: () => 'test'
        };

        get getter() {
          return 'got';
        }

        nested = new Interactor();
      };

      ExtendedInteractor = @TestInteractor.extend class ExtendedInteractor {
        static defaultScope = '.extended';
        bar = 'baz';
      };
    });

    it('retains the class name', () => {
      expect(TestInteractor.name).to.equal('TestInteractor');
      expect(ExtendedInteractor.name).to.equal('ExtendedInteractor');
    });

    it('retains static members', () => {
      expect(TestInteractor.defaultScope).to.equal('.test');
      expect(ExtendedInteractor.defaultScope).to.equal('.extended');
    });

    it('returns an interactor class with the specified properties', () => {
      expect(new TestInteractor()).to.have.property('foo', 'bar');
      expect(new TestInteractor()).to.have.property('getter', 'got');
      expect(new TestInteractor()).to.respondTo('test');
      expect(new TestInteractor().nested).to.be.an.instanceOf(Interactor)
        .that.has.property('__parent__').that.is.an.instanceOf(TestInteractor);
    });

    it('extends the origin class', () => {
      expect(new ExtendedInteractor()).to.have.property('bar', 'baz');
      expect(new ExtendedInteractor()).to.be.an.instanceOf(TestInteractor);
    });
  });
});
