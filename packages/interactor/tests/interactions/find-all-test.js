/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, findAll } from '../../src';

@interactor class FindInteractor {
  paragraphs = findAll('.test-p');
  nothing = findAll('.test-existence');
}

describe('BigTest Interaction: findAll', () => {
  let test;

  useFixture('find-fixture');

  beforeEach(() => {
    test = new FindInteractor();
  });

  it('has a findAll method', () => {
    expect(test).to.respondTo('findAll');
  });

  it('has findAll properties', () => {
    expect(test).to.have.property('paragraphs').that.is.an('array');
    expect(test).to.have.property('nothing').that.is.an('array');
  });

  it('returns a new instance from `#findAll()`', () => {
    expect(test.findAll('.test-p')).to.not.equal(test);
    expect(test.findAll('.test-p')).to.be.an.instanceof(FindInteractor);
  });

  it('eventually returns an array of elements from `#findAll()`', async () => {
    await expect(test.findAll('.test-p').do(all => {
      expect(all).to.have.lengthOf(2);
      all.forEach($p => expect($p).to.be.an.instanceOf(Element));
    }).run()).to.be.fulfilled;
  });

  it('returns an array of elements from findAll properties', () => {
    expect(test.paragraphs).to.have.lengthOf(2);
    test.paragraphs.forEach($p => expect($p).to.be.an.instanceOf(Element));
  });

  it('returns an empty array when elements do not exist', async () => {
    await expect(test.findAll('.test-existence')).to.be.fulfilled
      .and.eventually.have.lengthOf(0);
    expect(test.nothing).to.have.lengthOf(0);
  });

  it('throws an error when the scope does not exist', async () => {
    let test = new FindInteractor('#scoped-existence').timeout(50);

    await expect(test.findAll('.test-p'))
      .to.be.rejectedWith('unable to find "#scoped-existence"');
    expect(() => test.paragraphs)
      .to.throw('unable to find "#scoped-existence"');
  });
});
