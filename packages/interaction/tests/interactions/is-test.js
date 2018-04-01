/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, is } from '../../src';

const IsInteractor = interactor(function() {
  this.isTest = is('.test-p', '[data-test]');
});

describe('BigTest Interaction: is', () => {
  let test;

  useFixture('is-fixture');

  beforeEach(() => {
    test = new IsInteractor();
  });

  it('has an is property', () => {
    expect(test).to.have.property('isTest').that.is.a('boolean');
  });

  it('returns true if the element matches the selector', () => {
    expect(test.isTest).to.be.true;
  });

  it('returns false if the element does not match the selector', () => {
    test = new IsInteractor('#scoped');
    expect(test.isTest).to.be.false;
  });
});
