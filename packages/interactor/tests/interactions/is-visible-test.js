/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, isVisible } from '../../src';

@interactor class VisibleInteractor {
  isDivVisible = isVisible('.test-div');
}

describe('BigTest Interaction: isVisible', () => {
  let test;

  useFixture('visibility-fixture');

  beforeEach(() => {
    test = new VisibleInteractor('#visible');
  });

  it('has an "isVisible" property', () => {
    expect(test).to.have.property('isVisible').that.is.a('boolean');
    expect(test).to.have.property('isDivVisible').that.is.a('boolean');
  });

  it('returns true if the element is visible', () => {
    expect(test.isVisible).to.be.true;
    expect(test.isDivVisible).to.be.true;
  });

  it('returns false if the element is not visible', () => {
    test = new VisibleInteractor('#not-visible');
    expect(test.isVisible).to.be.false;
    expect(test.isDivVisible).to.be.false;
  });
});
