/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { page, hasClass } from '../../src';

describe('BigTest Interaction: hasClass', () => {
  useFixture('hasClass-fixture');

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.isCool = hasClass('cool', '.test-div');
        }
      });
    });

    it('has a hasClass property', () => {
      expect(new TestPage())
        .to.have.property('isCool')
        .that.is.a('boolean');
    });

    it('returns true when the element has the class', () => {
      expect(new TestPage().isCool).to.be.true;
    });

    it('returns false when the element does not have the class', () => {
      expect(new TestPage('#scoped').isCool).to.be.false;
    });
  });
});
