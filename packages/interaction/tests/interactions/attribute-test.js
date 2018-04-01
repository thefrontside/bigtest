/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, attribute } from '../../src';

const AttrInteractor = interactor(function() {
  this.data = attribute('data-attr');
  this.placeholder = attribute('.test-input', 'placeholder');
});

describe('BigTest Interaction: attribute', () => {
  let test;

  useFixture('attribute-fixture');

  beforeEach(() => {
    test = new AttrInteractor('.test-div');
  });

  it('has attribute properties', () => {
    expect(test).to.have.property('data').that.is.a('string');
    expect(test).to.have.property('placeholder').that.is.a('string');
  });

  it('returns the correct attributes', () => {
    expect(test.data).to.equal('bot');
    expect(test.placeholder).to.equal('beep boop');
  });
});
