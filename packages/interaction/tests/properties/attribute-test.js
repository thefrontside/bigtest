/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { page, attribute } from '../../src';

describe('BigTest Interaction: attribute', () => {
  useFixture('attribute-fixture');

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.data = attribute('data-attr', '.test-div');
          this.placeholder = attribute('placeholder', '.test-input');
        }
      });
    });

    it('has attribute properties', () => {
      expect(new TestPage())
        .to.have.property('data')
        .that.is.a('string');
      expect(new TestPage())
        .to.have.property('placeholder')
        .that.is.a('string');
    });

    it('returns the correct attribute', () => {
      expect(new TestPage().data).to.equal('bot');
      expect(new TestPage().placeholder).to.equal('beep boop');
    });

    describe('when scoped', () => {
      it('returns the scoped attribute', () => {
        expect(new TestPage('#scoped').placeholder).to.equal('something clever');
      });
    });
  });
});
