/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, find } from '../../src';

@interactor class FindInteractor {
  $p = find('.test-p');
  $noexist = find('.test-existence');
}

describe('BigTest Interaction: find', () => {
  let test;

  useFixture('find-fixture');

  beforeEach(() => {
    test = new FindInteractor();
  });

  it('has a find method', () => {
    expect(test).to.respondTo('find');
  });

  it('returns a new instance from `#find()`', () => {
    expect(test.find('.test-p')).to.not.equal(test);
    expect(test.find('.test-p')).to.be.an.instanceof(FindInteractor);
  });

  it('returns the first element from find properties', () => {
    expect(test.$p).to.be.an.instanceOf(Element);
    expect(test.$p.innerText).to.equal('This is a test');
  });

  it('eventually returns the first element from `#find()`', async () => {
    await expect(test.find('.test-p').do($p => {
      expect($p).to.be.an.instanceOf(Element);
      expect($p.innerText).to.equal('This is a test');
    }).run()).to.be.fulfilled;
  });

  it('throws an error when the element does not exist', async () => {
    await expect(test.find('.test-existence').timeout(50).run())
      .to.be.rejectedWith('unable to find ".test-existence"');
    expect(() => test.$noexist)
      .to.throw('unable to find ".test-existence"');
  });

  it('throws an error when the scope does not exist', async () => {
    let test = new FindInteractor('#scoped-existence').timeout(50);

    await expect(test.find('.test-existence').timeout(50).run())
      .to.be.rejectedWith('unable to find "#scoped-existence"');
    expect(() => test.$noexist)
      .to.throw('unable to find "#scoped-existence"');
  });
});
