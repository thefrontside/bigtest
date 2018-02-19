/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { page, value } from '../../src';

describe('BigTest Interaction: value', () => {
  useFixture('value-fixture');

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.inputVal = value('.test-input');
        }
      });
    });

    it('has a value property', () => {
      expect(new TestPage())
        .to.have.property('inputVal')
        .that.is.a('string');
    });

    it('returns the input value', () => {
      expect(new TestPage().inputVal).to.equal('Hello value!');
    });

    describe('when scoped', () => {
      it('returns the scoped input value', () => {
        expect(new TestPage('#scoped').inputVal).to.equal('Hello scope!');
      });
    });
  });
});
