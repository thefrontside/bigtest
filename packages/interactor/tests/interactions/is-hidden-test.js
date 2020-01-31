/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, isHidden } from '../../src';

@interactor class HiddenInteractor {
  isDivHidden = isHidden('.test-div');
}

describe('BigTest Interaction: isHidden', () => {
  let test;

  useFixture('visibility-fixture');

  beforeEach(() => {
    test = new HiddenInteractor('#not-visible');
  });

  it('has isHidden properties', () => {
    expect(test).to.have.property('isHidden').that.is.a('boolean');
    expect(test).to.have.property('isDivHidden').that.is.a('boolean');
  });

  it('returns true if the element is hidden', () => {
    expect(test.isHidden).to.be.true;
    expect(test.isDivHidden).to.be.true;
  });

  it('returns false if the element is not hidden', () => {
    test = new HiddenInteractor('#visible');
    expect(test.isHidden).to.be.false;
    expect(test.isDivHidden).to.be.false;
  });
});
