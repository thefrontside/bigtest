/* global describe, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, count } from '../../src';

const ListInteractor = interactor(function() {
  this.size = count('.test-item');
});

describe('BigTest Interaction: count', () => {
  useFixture('count-fixture');

  it('has a count property', () => {
    expect(new ListInteractor())
      .to.have.property('size')
      .that.is.a('number');
  });

  it('returns the element count', () => {
    expect(new ListInteractor().size).to.equal(6);
    expect(new ListInteractor('#short').size).to.equal(2);
  });
});
