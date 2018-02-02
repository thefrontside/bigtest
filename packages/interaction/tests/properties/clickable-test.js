/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { Interaction, page, clickable } from '../../src';

describe('BigTest Interaction: clickable', () => {
  let clicked;

  useFixture('click-fixture');

  beforeEach(() => {
    clicked = false;

    document.querySelector('.test-btn')
      .addEventListener('click', () => clicked = true);
  });

  describe('Interaction', () => {
    let interaction;

    beforeEach(() => {
      interaction = new Interaction();
    });

    it('has a click method', () => {
      expect(interaction).to.respondTo('click');
    });

    it('is immutable', () => {
      let click = interaction.click('.test-btn');
      expect(click).to.not.equal(interaction);
      expect(click).to.be.an.instanceof(Interaction);
    });

    it('eventually clicks the element', async () => {
      let click = interaction.click('.test-btn');
      await expect(click.run()).to.be.fulfilled;
      expect(clicked).to.be.true;
    });

    it('eventually clicks the scoped element', async () => {
      let click = new Interaction('.test-btn').click();
      await expect(click.run()).to.be.fulfilled;
      expect(clicked).to.be.true;
    });
  });

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.clickBtn = clickable('.test-btn');
        }
      });
    });

    it('has a click method', () => {
      expect(new TestPage().click).to.be.a('function');
    });

    it('has a custom clickable method', () => {
      expect(new TestPage().clickBtn).to.be.a('function');
    });

    it('returns a custom interaction', () => {
      let click = new TestPage().clickBtn();
      expect(click).to.be.an.instanceOf(TestPage.Interaction);
      expect(click).to.be.an.instanceOf(Interaction);
    });

    it('has a chainable interface', () => {
      let click = new TestPage().clickBtn();
      expect(click.clickBtn).to.be.a('function');
    });

    it('eventually clicks a given element', async () => {
      let click = new TestPage().click('.test-btn');
      await expect(click.run()).to.be.fulfilled;
      expect(clicked).to.be.true;
    });

    it('eventually clicks the specified element', async () => {
      let click = new TestPage().clickBtn();
      await expect(click.run()).to.be.fulfilled;
      expect(clicked).to.be.true;
    });
  });
});
