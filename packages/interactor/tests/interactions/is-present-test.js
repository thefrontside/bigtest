/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, isPresent } from '../../src';

@interactor class PresentInteractor {
  isDivPresent = isPresent('.test-div');
}

describe('BigTest Interaction: isPresent', () => {
  let test;

  useFixture('visibility-fixture');

  beforeEach(() => {
    test = new PresentInteractor('#not-visible');
  });

  it('has isPresent properties', () => {
    expect(test).to.have.property('isPresent').that.is.a('boolean');
    expect(test).to.have.property('isDivPresent').that.is.a('boolean');
  });

  it('returns true if the element exists', () => {
    expect(test.isPresent).to.be.true;
    expect(test.isDivPresent).to.be.true;
  });

  it('returns false if the element does not exist', () => {
    test = new PresentInteractor('#non-existent');
    expect(test.isPresent).to.be.false;
    expect(test.isDivPresent).to.be.false;
  });
});
