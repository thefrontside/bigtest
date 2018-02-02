/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { page, isHidden } from '../../src';

describe('BigTest Interaction: isHidden', () => {
  useFixture('visibility-fixture');

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.isDisplayHidden = isHidden('.test-div');
        }
      });
    });

    it('has an "isVisible" property', () => {
      expect(new TestPage('#not-visible'))
        .to.have.property('isDisplayHidden')
        .that.is.a('boolean');
    });

    it('returns true if the element is hidden', () => {
      expect(new TestPage('#not-visible').isDisplayHidden).to.be.true;
    });

    it('returns false if the element is not hidden', () => {
      expect(new TestPage('#visible').isDisplayHidden).to.be.false;
    });
  });
});
