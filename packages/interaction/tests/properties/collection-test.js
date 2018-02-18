/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { page, collection, text, clickable } from '../../src';

describe('BigTest Interaction: collection', () => {
  useFixture('collection-fixture');

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.items = collection('.test-item', {
            content: text('.test-p'),
            clickBtn: clickable('button')
          });
        }
      });
    });

    it('has a collection method', () => {
      expect(new TestPage()).to.respondTo('items');
    });

    it('returns an object scoped to the element at an index', () => {
      expect(new TestPage().items(2))
        .to.be.an('object')
        .that.has.property('$root')
        .that.has.property('id', 'c');
    });

    it('returns an array of scoped objects when no index is provided', () => {
      expect(new TestPage().items())
        .to.be.an('Array')
        .that.has.lengthOf(4);
    });

    it('has a scoped text property ', () => {
      let item = new TestPage().items(3);

      expect(item).to.have.property('content')
        .that.is.a('string')
        .that.equals('Item D');
    });

    it('has a scoped click property ', async () => {
      let item = new TestPage().items(1);
      let clicked = false;

      document.querySelector('#b button')
        .addEventListener('click', () => clicked = true);

      expect(item).to.respondTo('clickBtn');
      await expect(item.clickBtn().run()).to.be.fulfilled;
      expect(clicked).to.be.true;
    });

    it('allows clicking directly on the scoped element', async () => {
      let item = new TestPage().items(0);
      let clicked = false;

      document.querySelector('#a')
        .addEventListener('click', () => clicked = true);

      expect(item).to.respondTo('click');
      await expect(item.click().run()).to.be.fulfilled;
      expect(clicked).to.be.true;
    });

    it('is not chainable from interaction methods', () => {
      let interaction = new TestPage().click('#a button');
      expect(interaction).to.not.respondTo('items');
    });

    it('throws an error when the element does not exist', () => {
      expect(() => new TestPage().items(99))
        .to.throw('unable to find ".test-item" at index 99');
    });
  });
});
