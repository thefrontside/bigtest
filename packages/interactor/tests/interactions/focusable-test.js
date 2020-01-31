/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, focusable } from '../../src';
import { when } from '@bigtest/convergence';

@interactor class FocusInteractor {
  focusInput = focusable('.test-input');
}

describe('BigTest Interaction: focusable', () => {
  let focused, focusedIn, test, $input;

  useFixture('input-fixture');

  beforeEach(() => {
    focused = false;
    focusedIn = false;
    $input = document.querySelector('.test-input');

    $input.addEventListener('focus', e => {
      focused = e.target === document.activeElement;
    });

    $input.addEventListener('focusin', e => {
      focusedIn = e.target === document.activeElement;
    });

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
    await when(() => {
      expect(focused).to.be.true;
      expect(focusedIn).to.be.true;
    });
  });

  it('eventually focuses the custom element', async () => {
    await expect(test.focusInput().run()).to.be.fulfilled;
    await when(() => {
      expect(focused).to.be.true;
      expect(focusedIn).to.be.true;
    });
  });

  describe('overwriting the default focus method', () => {
    beforeEach(() => {
      test = new (@interactor class {
        focus = focusable('.test-input');
      })();
    });

    it('focuses the correct element', async () => {
      await expect(test.focus().run()).to.be.fulfilled;
      expect(focused).to.be.true;
    });
  });
});
