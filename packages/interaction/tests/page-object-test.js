/* global describe, beforeEach, it */
import { expect } from 'chai';
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
});
