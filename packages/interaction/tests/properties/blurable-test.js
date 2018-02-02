/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { Interaction, page, blurrable } from '../../src';

describe('BigTest Interaction: blurrable', () => {
  let blurred;

  useFixture('input-fixture');

  beforeEach(() => {
    blurred = false;

    document.querySelector('.test-input')
      .addEventListener('blur', () => blurred = true);
  });

  describe('Interaction', () => {
    let interaction;

    beforeEach(() => {
      interaction = new Interaction();
    });

    it('has a blur method', () => {
      expect(interaction).to.respondTo('blur');
    });

    it('is immutable', () => {
      let blur = interaction.blur('.test-input');
      expect(blur).to.not.equal(interaction);
      expect(blur).to.be.an.instanceof(Interaction);
    });

    it('eventually blurs the element', async () => {
      let blur = interaction.blur('.test-input');
      await expect(blur.run()).to.be.fulfilled;
      expect(blurred).to.be.true;
    });
  });

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.blurInput = blurrable('.test-input');
        }
      });
    });

    it('has a blur method', () => {
      expect(new TestPage()).to.respondTo('blur');
    });

    it('has a custom blurrable method', () => {
      expect(new TestPage()).to.respondTo('blurInput');
    });

    it('returns a custom interaction', () => {
      let blur = new TestPage().blurInput();
      expect(blur).to.be.an.instanceOf(TestPage.Interaction);
      expect(blur).to.be.an.instanceOf(Interaction);
    });

    it('has a chainable interface', () => {
      let blur = new TestPage().blurInput();
      expect(blur.blurInput).to.be.a('function');
    });

    it('eventually blurs the given element', async () => {
      let blur = new TestPage().blur('.test-input');
      await expect(blur.run()).to.be.fulfilled;
      expect(blurred).to.be.true;
    });

    it('eventually blurs the specified element', async () => {
      let blur = new TestPage().blurInput();
      await expect(blur.run()).to.be.fulfilled;
      expect(blurred).to.be.true;
    });
  });
});
