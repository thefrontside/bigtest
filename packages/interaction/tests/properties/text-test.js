/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { page, text } from '../../src';

describe('BigTest Interaction: text', () => {
  useFixture('text-fixture');

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.content = text('.test-p');
        }
      });
    });

    it('has a text property', () => {
      expect(new TestPage())
        .to.have.property('content')
        .that.is.a('string');
    });

    it('returns the element\'s innerText', () => {
      expect(new TestPage().content).to.equal('Hello text!');
    });

    describe('when scoped', () => {
      it('returns the scoped element\'s innerText', () => {
        expect(new TestPage('#scoped').content).to.equal('Hello scope!');
      });
    });
  });
});
