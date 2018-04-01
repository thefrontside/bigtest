/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, property } from '../../src';

const PropInteractor = interactor(function() {
  this.height = property('offsetHeight');
  this.isChecked = property('.test-checkbox', 'checked');
});

describe('BigTest Interaction: property', () => {
  let test;

  useFixture('property-fixture');

  beforeEach(() => {
    test = new PropInteractor('.test-div');
  });

  it('has property properties', () => {
    expect(test).to.have.property('height').that.is.a('number');
    expect(test).to.have.property('isChecked').that.is.a('boolean');
  });

  it('returns the correct property', () => {
    expect(test.height).to.equal(100);
    expect(test.isChecked).to.be.true;
  });
});
