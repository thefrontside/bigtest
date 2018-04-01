/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, hasClass } from '../../src';

const ClassInteractor = interactor(function() {
  this.isCool = hasClass('cool');
  this.isAlsoCool = hasClass('.some-div', 'also-cool');
  this.isOtherCool = hasClass('.other-div', 'also-cool');
});

describe('BigTest Interaction: hasClass', () => {
  let test;

  useFixture('has-class-fixture');

  beforeEach(() => {
    test = new ClassInteractor('#scope');
  });

  it('has hasClass properties', () => {
    expect(test).to.have.property('isCool').that.is.a('boolean');
    expect(test).to.have.property('isAlsoCool').that.is.a('boolean');
    expect(test).to.have.property('isOtherCool').that.is.a('boolean');
  });

  it('returns true when the element has the class', () => {
    expect(test.isCool).to.be.true;
    expect(test.isAlsoCool).to.be.true;
  });

  it('returns false when the element does not have the class', () => {
    expect(test.isOtherCool).to.be.false;
  });
});
