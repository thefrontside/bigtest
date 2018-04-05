/* global describe, beforeEach, it, Element */
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

  it('has a `pause` method', () => {
    expect(instance).to.respondTo('pause');
    expect(instance.pause()).to.be.an.instanceOf(Interactor);
    expect(instance.pause()).to.not.equal(instance);
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

    it('throws when scope does not exist', () => {
      let scoped = new Interactor('#not-scoped').timeout(50);
      expect(() => scoped.$root).to.throw('unable to find "#not-scoped"');
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
});
