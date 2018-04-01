/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, scrollable } from '../../src';

const ScrollInteractor = interactor(function() {
  this.scrollDiv = scrollable('.test-div');
});

describe('BigTest Interaction: scrollable', () => {
  let test, offset;

  useFixture('scroll-fixture');

  beforeEach(() => {
    offset = { top: 0, left: 0 };

    document.querySelector('.test-div')
      .addEventListener('scroll', (e) => {
        offset.top = e.currentTarget.scrollTop;
        offset.left = e.currentTarget.scrollLeft;
      });

    test = new ScrollInteractor();
  });

  it('has scrollable methods', () => {
    expect(test).to.respondTo('scroll');
    expect(test).to.respondTo('scrollDiv');
  });

  it('returns a new instance', () => {
    expect(test.scroll('.test-div', {})).to.not.equal(test);
    expect(test.scroll('.test-div', {})).to.be.an.instanceof(ScrollInteractor);
    expect(test.scrollDiv({})).to.not.equal(test);
    expect(test.scrollDiv({})).to.be.an.instanceof(ScrollInteractor);
  });

  it('eventually scrolls the element', async () => {
    await expect(test.scroll('.test-div', { top: 100, left: 50 }).run()).to.be.fulfilled;
    expect(offset).to.deep.equal({ top: 100, left: 50 });

    await expect(test.scrollDiv({ top: 50, left: 100 }).run()).to.be.fulfilled;
    expect(offset).to.deep.equal({ top: 50, left: 100 });
  });
});
