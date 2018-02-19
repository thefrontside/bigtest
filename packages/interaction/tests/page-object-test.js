/* global describe, beforeEach, it, Element */
import { expect } from 'chai';
import { useFixture } from './helpers';
import { Interaction, page } from '../src';

describe('BigTest Interaction: Page Object', () => {
  let TestPage;

  beforeEach(() => {
    TestPage = page(class TestPage {
      constructor() {
        this.test = 'testing';
      }

      get getter() {
        return 'got';
      }
    });
  });

  it('retains the class name', () => {
    expect(TestPage.name).to.equal('TestPage');
  });

  it('has a custom interaction class', () => {
    expect(TestPage.Interaction).to.not.equal(Interaction);
    expect(new TestPage.Interaction()).to.be.an.instanceof(Interaction);
  });

  it('has an interaction property', () => {
    expect(new TestPage()).to.have.property('interaction')
      .that.is.an.instanceof(Interaction);
  });

  it('has a default $root element', () => {
    expect(new TestPage()).to.have.property('$root', document.body);
  });

  it('allows a custom $root element', () => {
    let $el = document.createElement('div');
    expect(new TestPage($el)).to.have.property('$root', $el);
  });

  it('uses the $root as the interaction scope', () => {
    let $el = document.createElement('div');
    expect(new TestPage($el).interaction).to.have.property('$scope', $el);
  });

  it('preserves instance initializers', () => {
    expect(new TestPage()).to.have.property('test', 'testing');
  });

  it('preserves property descriptors', () => {
    expect(new TestPage()).to.have.property('getter', 'got');
  });

  describe('DOM helpers', () => {
    useFixture('find-fixture');

    beforeEach(() => {
      TestPage = page(class TestPage {});
    });

    it('has a helper for finding a single DOM element', () => {
      expect(new TestPage().$('.test-p')).to.be.an.instanceOf(Element);
      expect(new TestPage('.test-p').$()).to.be.an.instanceOf(Element);
    });

    it('throws when finding a single element that does not exist', () => {
      expect(() => new TestPage().$('.test-exists'))
        .to.throw('unable to find ".test-exists"');
    });

    it('has a helper for finding multiple DOM elements', () => {
      expect(new TestPage().$$('.test-p')).to.have.lengthOf(2);
      expect(new TestPage('.test-p').$$()).to.have.lengthOf(0);
    });
  });
});
