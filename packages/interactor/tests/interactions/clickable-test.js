/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, clickable } from '../../src';

@interactor class ClickInteractor {
  clickBtn = clickable('.test-btn');
}

describe('BigTest Interaction: clickable', () => {
  let clicked, test;

  useFixture('click-fixture');

  beforeEach(() => {
    clicked = false;

    document.querySelector('.test-btn')
      .addEventListener('click', () => clicked = true);

    test = new ClickInteractor();
  });

  it('has clickable methods', () => {
    expect(test).to.respondTo('click');
    expect(test).to.respondTo('clickBtn');
  });

  it('returns a new instance', () => {
    expect(test.click('.test-btn')).to.not.equal(test);
    expect(test.click('.test-btn')).to.be.an.instanceof(ClickInteractor);
    expect(test.clickBtn()).to.not.equal(test);
    expect(test.clickBtn()).to.be.an.instanceof(ClickInteractor);
  });

  it('eventually clicks the element', async () => {
    await expect(test.click('.test-btn').run()).to.be.fulfilled;
    expect(clicked).to.be.true;

    clicked = true;
    await expect(test.clickBtn().run()).to.be.fulfilled;
    expect(clicked).to.be.true;
  });

  describe('overwriting the default click method', () => {
    beforeEach(() => {
      test = new (@interactor class {
        click = clickable('.test-btn');
      })();
    });

    it('clicks the correct element', async () => {
      await expect(test.click().run()).to.be.fulfilled;
      expect(clicked).to.be.true;
    });
  });
});
