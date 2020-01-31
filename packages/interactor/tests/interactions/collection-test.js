/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, collection, text, clickable } from '../../src';

@interactor class ItemInteractor {
  content = text('.test-p');
  clickBtn = clickable('button');
}

@interactor class CollectionInteractor {
  simple = collection('.test-item');
  items = collection('.test-item', ItemInteractor);

  byId = collection(
    (id) => id ? `#${id}` : '.test-item',
    ItemInteractor
  );
}

describe('BigTest Interaction: collection', () => {
  let test;

  useFixture('collection-fixture');

  beforeEach(() => {
    test = new CollectionInteractor();
  });

  it('has collection methods', () => {
    expect(test).to.respondTo('simple');
    expect(test).to.respondTo('items');
    expect(test).to.respondTo('byId');
  });

  it('returns an interactor scoped to the element at an index', () => {
    expect(test.simple(0)).to.have.property('$root').that.has.property('id', 'a');
    expect(test.items(1)).to.have.property('$root').that.has.property('id', 'b');
  });

  it('returns an interactor scoped to the element by a generated selector', () => {
    expect(test.byId('c')).to.have.property('$root').that.has.property('id', 'c');
  });

  it('returns an array of interactors when no argument is provided', () => {
    expect(test.simple()).to.be.an('Array').that.has.lengthOf(4);
    expect(test.items()).to.be.an('Array').that.has.lengthOf(4);
    expect(test.byId()).to.be.an('Array').that.has.lengthOf(4)
      .that.satisfies((items) => items.every((item) => {
        return expect(item).to.be.an.instanceof(ItemInteractor)
          .and.have.property('$root').that.has.property('className', 'test-item');
      }));
  });

  it('has nested interactions', () => {
    expect(test.items(1)).to.be.an.instanceOf(ItemInteractor);
    expect(test.items(1)).to.have.property('content');
    expect(test.items(1)).to.respondTo('clickBtn');
  });

  it('has a scoped text property', () => {
    expect(test.byId('d')).to.have.property('content').that.equals('Item D');
  });

  it('has scoped clickable properties', async () => {
    let clickedA = false;
    let clickedB = false;

    document.querySelector('#a button')
      .addEventListener('click', () => clickedA = true);
    document.querySelector('#b')
      .addEventListener('click', () => clickedB = true);

    await expect(test.byId('a').clickBtn().run()).to.be.fulfilled;
    expect(clickedA).to.be.true;

    await expect(test.byId('b').click().run()).to.be.fulfilled;
    expect(clickedB).to.be.true;
  });

  it('returns new parent instances from collection methods', () => {
    expect(test.items(0).click()).to.not.equal(test);
    expect(test.items(0).click()).to.be.an.instanceOf(CollectionInteractor);
  });

  it('returns own instances from collection methods after calling #only', () => {
    expect(test.items(0).only()).to.be.an.instanceOf(ItemInteractor);
    expect(test.items(0).only().click()).to.be.an.instanceOf(ItemInteractor);
  });

  it('lazily throws an error when the element does not exist', () => {
    let item = test.items(99);

    return expect(() => item.$root)
      .to.throw('unable to find ".test-item" at index 99');
  });
});
