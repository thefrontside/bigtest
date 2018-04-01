/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, collection, text, clickable } from '../../src';

const ItemInteractor = interactor(function() {
  this.content = text('.test-p');
  this.clickBtn = clickable('button');
});

const CollectionInteractor = interactor(function() {
  this.simple = collection('.test-item');
  this.items = collection('.test-item', ItemInteractor);
  this.nested = collection('.test-item', {
    content: text('.test-p'),
    clickBtn: clickable('button')
  });
});

describe('BigTest Interaction: collection', () => {
  let test;

  useFixture('collection-fixture');

  beforeEach(() => {
    test = new CollectionInteractor();
  });

  it('has collection methods', () => {
    expect(test).to.respondTo('simple');
    expect(test).to.respondTo('items');
    expect(test).to.respondTo('nested');
  });

  it('returns an interactor scoped to the element at an index', () => {
    expect(test.simple(2))
      .to.be.an('object')
      .that.has.property('$root')
      .that.has.property('id', 'c');
  });

  it('returns an array of interactors when no index is provided', () => {
    expect(test.simple())
      .to.be.an('Array')
      .that.has.lengthOf(4);
  });

  it('has nested interactions', () => {
    expect(test.nested(1)).to.have.property('content');
    expect(test.nested(1)).to.respondTo('clickBtn');
  });

  it('has a scoped text property', () => {
    expect(test.items(3))
      .to.have.property('content')
      .that.is.a('string')
      .that.equals('Item D');
  });

  it('has scoped clickable properties', async () => {
    let clickedA = false;
    let clickedB = false;

    document.querySelector('#a button')
      .addEventListener('click', () => clickedA = true);
    document.querySelector('#b')
      .addEventListener('click', () => clickedB = true);

    await expect(test.items(0).clickBtn().run()).to.be.fulfilled;
    expect(clickedA).to.be.true;

    await expect(test.items(1).click().run()).to.be.fulfilled;
    expect(clickedB).to.be.true;
  });

  it('returns a new parent instance from collection interactor methods', () => {
    expect(test.items(0).click()).to.not.equal(test);
    expect(test.items(0).click()).to.be.an.instanceOf(CollectionInteractor);
  });

  it('lazily throws an error when the element does not exist', () => {
    let item = test.items(99);

    return expect(() => item.$root)
      .to.throw('unable to find ".test-item" at index 99');
  });
});
