/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { page, count } from '../../src';

describe('BigTest Interaction: count', () => {
  useFixture('count-fixture');

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.listLength = count('.test-item');
        }
      });
    });

    it('has a count property', () => {
      expect(new TestPage())
        .to.have.property('listLength')
        .that.is.a('number');
    });

    it('returns the element count', () => {
      expect(new TestPage().listLength).to.equal(6);
    });

    describe('when scoped', () => {
      it('returns the scoped element count', () => {
        expect(new TestPage('#scoped').listLength).to.equal(2);
      });
    });
  });
});
