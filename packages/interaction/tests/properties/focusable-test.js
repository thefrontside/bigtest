/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { Interaction, page, focusable } from '../../src';

describe('BigTest Interaction: focusable', () => {
  let focused;

  useFixture('input-fixture');

  beforeEach(() => {
    focused = false;

    document.querySelector('.test-input')
      .addEventListener('focus', () => focused = true);
  });

  describe('Interaction', () => {
    let interaction;

    beforeEach(() => {
      interaction = new Interaction();
    });

    it('has a focus method', () => {
      expect(interaction).to.respondTo('focus');
    });

    it('is immutable', () => {
      let focus = interaction.focus('.test-input');
      expect(focus).to.not.equal(interaction);
      expect(focus).to.be.an.instanceof(Interaction);
    });

    it('eventually focuses the element', async () => {
      let focus = interaction.focus('.test-input');
      await expect(focus.run()).to.be.fulfilled;
      expect(focused).to.be.true;
    });
  });

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.focusInput = focusable('.test-input');
        }
      });
    });

    it('has a focus method', () => {
      expect(new TestPage()).to.respondTo('focus');
    });

    it('has a custom focusable method', () => {
      expect(new TestPage()).to.respondTo('focusInput');
    });

    it('returns a custom interaction', () => {
      let focus = new TestPage().focusInput();
      expect(focus).to.be.an.instanceOf(TestPage.Interaction);
      expect(focus).to.be.an.instanceOf(Interaction);
    });

    it('has a chainable interface', () => {
      let focus = new TestPage().focusInput();
      expect(focus.focusInput).to.be.a('function');
    });

    it('eventually focuses the given element', async () => {
      let focus = new TestPage().focus('.test-input');
      await expect(focus.run()).to.be.fulfilled;
      expect(focused).to.be.true;
    });

    it('eventually focuses the specified element', async () => {
      let focus = new TestPage().focusInput();
      await expect(focus.run()).to.be.fulfilled;
      expect(focused).to.be.true;
    });
  });
});
