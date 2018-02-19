/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { page, is } from '../../src';

describe('BigTest Interaction: is', () => {
  useFixture('is-fixture');

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.isTest = is('[data-test]', '.test-p');
        }
      });
    });

    it('has an "is" property', () => {
      expect(new TestPage())
        .to.have.property('isTest')
        .that.is.a('boolean');
    });

    it('returns true if the element matches the selector', () => {
      expect(new TestPage().isTest).to.be.true;
    });

    it('returns false if the element does not match the selector', () => {
      expect(new TestPage('#scoped').isTest).to.be.false;
    });
  });
});
