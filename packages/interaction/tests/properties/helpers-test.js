/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { page, computed, action } from '../../src';

describe('BigTest Interaction: helpers', () => {
  useFixture('find-fixture');

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.content = computed(function() {
            return this.$().innerText;
          });

          this.doSomething = action(function() {
            return this;
          });
        }
      });
    });

    it('has a computed property', () => {
      expect(new TestPage())
        .to.have.property('content')
        .that.is.a('string');
    });

    it('has an action property', () => {
      expect(new TestPage()).to.respondTo('doSomething');
    });

    it('has a custom interaction method', () => {
      expect(new TestPage().interaction).to.respondTo('doSomething');
      expect(new TestPage().doSomething()).to.be.an.instanceOf(TestPage.Interaction);
    });
  });
});
