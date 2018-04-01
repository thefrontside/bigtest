/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, value } from '../../src';

const ValueInteractor = interactor(function() {
  this.inputVal = value('.test-input');
});

describe('BigTest Interaction: value', () => {
  let input, test;

  useFixture('value-fixture');

  beforeEach(() => {
    input = new ValueInteractor('.test-input');
    test = new ValueInteractor();
  });

  it('has value properties', () => {
    expect(input).to.have.property('value').that.is.a('string');
    expect(test).to.have.property('inputVal').that.is.a('string');
  });

  it('returns the input value', () => {
    expect(input.value).to.equal('Hello value!');
    expect(test.inputVal).to.equal('Hello value!');
  });
});
