/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { page, isVisible } from '../../src';

describe('BigTest Interaction: isVisible', () => {
  useFixture('visibility-fixture');

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.isDisplayVisible = isVisible('.test-div');
        }
      });
    });

    it('has an "isVisible" property', () => {
      expect(new TestPage('#visible'))
        .to.have.property('isDisplayVisible')
        .that.is.a('boolean');
    });

    it('returns true if the element is visible', () => {
      expect(new TestPage('#visible').isDisplayVisible).to.be.true;
    });

    it('returns false if the element is not visible', () => {
      expect(new TestPage('#not-visible').isDisplayVisible).to.be.false;
    });
  });
});
