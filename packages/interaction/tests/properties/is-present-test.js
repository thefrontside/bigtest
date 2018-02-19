/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { page, isPresent } from '../../src';

describe('BigTest Interaction: isVisible', () => {
  useFixture('visibility-fixture');

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.isThere = isPresent('.test-div');
          this.isNotThere = isPresent('.test-no-exist');
        }
      });
    });

    it('has an "isPresent" property', () => {
      expect(new TestPage('#visible'))
        .to.have.property('isThere')
        .that.is.a('boolean');
    });

    it('returns true if the element exists', () => {
      expect(new TestPage('#not-visible').isThere).to.be.true;
    });

    it('returns false if the element does not exist', () => {
      expect(new TestPage().isNotThere).to.be.false;
    });
  });
});
