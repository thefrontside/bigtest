/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { page, property } from '../../src';

describe('BigTest Interaction: property', () => {
  useFixture('property-fixture');

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.height = property('offsetHeight', '.test-div');
          this.isChecked = property('checked', '.test-checkbox');
        }
      });
    });

    it('has property properties', () => {
      expect(new TestPage())
        .to.have.property('height')
        .that.is.a('number');
      expect(new TestPage())
        .to.have.property('isChecked')
        .that.is.a('boolean');
    });

    it('returns the correct property', () => {
      expect(new TestPage().height).to.equal(100);
      expect(new TestPage().isChecked).to.be.true;
    });

    describe('when scoped', () => {
      it('returns the scoped property', () => {
        expect(new TestPage('#scoped').isChecked).to.be.false;
      });
    });
  });
});
