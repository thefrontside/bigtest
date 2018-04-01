/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, focusable } from '../../src';

const FocusInteractor = interactor(function() {
  this.focusInput = focusable('.test-input');
});

describe('BigTest Interaction: focusable', () => {
  let focused, test;

  useFixture('input-fixture');

  beforeEach(() => {
    focused = false;

    document.querySelector('.test-input')
      .addEventListener('focus', () => focused = true);

    test = new FocusInteractor();
  });

  it('has focusable methods', () => {
    expect(test).to.respondTo('focus');
    expect(test).to.respondTo('focusInput');
  });

  it('returns a new instance', () => {
    expect(test.focus('.test-input')).to.not.equal(test);
    expect(test.focus('.test-input')).to.be.an.instanceof(FocusInteractor);
    expect(test.focusInput()).to.not.equal(test);
    expect(test.focusInput()).to.be.an.instanceof(FocusInteractor);
  });

  it('eventually focuses the element', async () => {
    await expect(test.focus('.test-input').run()).to.be.fulfilled;
    expect(focused).to.be.true;

    focused = false;
    await expect(test.focusInput().run()).to.be.fulfilled;
    expect(focused).to.be.true;
  });
});
