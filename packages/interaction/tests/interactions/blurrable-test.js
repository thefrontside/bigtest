/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, blurrable } from '../../src';

const BlurInteractor = interactor(function() {
  this.blurInput = blurrable('.test-input');
});

describe('BigTest Interaction: blurrable', () => {
  let blurred, test;

  useFixture('input-fixture');

  beforeEach(() => {
    blurred = false;

    document.querySelector('.test-input')
      .addEventListener('blur', () => blurred = true);

    test = new BlurInteractor();
  });

  it('has blurrable methods', () => {
    expect(test).to.respondTo('blur');
    expect(test).to.respondTo('blurInput');
  });

  it('returns a new instance', () => {
    expect(test.blur('.test-input')).to.not.equal(test);
    expect(test.blur('.test-input')).to.be.an.instanceof(BlurInteractor);
    expect(test.blurInput()).to.not.equal(test);
    expect(test.blurInput()).to.be.an.instanceof(BlurInteractor);
  });

  it('eventually blurs the element', async () => {
    await expect(test.blur('.test-input').run()).to.be.fulfilled;
    expect(blurred).to.be.true;

    blurred = false;
    await expect(test.blurInput().run()).to.be.fulfilled;
    expect(blurred).to.be.true;
  });
});
