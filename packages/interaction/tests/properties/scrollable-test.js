/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { Interaction, page, scrollable } from '../../src';

describe('BigTest Interaction: scrollable', () => {
  let offsetLeft, offsetTop;

  useFixture('scroll-fixture');

  beforeEach(() => {
    offsetLeft = 0;
    offsetTop = 0;

    document.querySelector('.test-div')
      .addEventListener('scroll', (e) => {
        offsetLeft = e.currentTarget.scrollLeft;
        offsetTop = e.currentTarget.scrollTop;
      });
  });

  describe('Interaction', () => {
    let interaction;

    beforeEach(() => {
      interaction = new Interaction();
    });

    it('has a scroll method', () => {
      expect(interaction).to.respondTo('scroll');
    });

    it('is immutable', () => {
      let scroll = interaction.scroll('.test-div', {});
      expect(scroll).to.not.equal(interaction);
      expect(scroll).to.be.an.instanceof(Interaction);
    });

    it('eventually scrolls the element', async () => {
      let scroll = interaction.scroll('.test-div', { left: 50, top: 100 });
      await expect(scroll.run()).to.be.fulfilled;
      expect(offsetLeft).to.equal(50);
      expect(offsetTop).to.equal(100);
    });

    it('eventually scrolls the scoped element', async () => {
      let scroll = new Interaction('.test-div').scroll({ left: 20, top: 50 });
      await expect(scroll.run()).to.be.fulfilled;
      expect(offsetLeft).to.equal(20);
      expect(offsetTop).to.equal(50);
    });
  });

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.scrollDiv = scrollable('.test-div');
        }
      });
    });

    it('has a scroll method', () => {
      expect(new TestPage().scroll).to.be.a('function');
    });

    it('has a custom scrollable method', () => {
      expect(new TestPage().scrollDiv).to.be.a('function');
    });

    it('returns a custom interaction', () => {
      let scroll = new TestPage().scrollDiv();
      expect(scroll).to.be.an.instanceOf(TestPage.Interaction);
      expect(scroll).to.be.an.instanceOf(Interaction);
    });

    it('has a chainable interface', () => {
      let scroll = new TestPage().scrollDiv();
      expect(scroll.scrollDiv).to.be.a('function');
    });

    it('eventually scrolls a given element', async () => {
      let scroll = new TestPage().scroll('.test-div', { left: 20, top: 50 });
      await expect(scroll.run()).to.be.fulfilled;
      expect(offsetLeft).to.equal(20);
      expect(offsetTop).to.equal(50);
    });

    it('eventually scrolls the specified element', async () => {
      let scroll = new TestPage().scrollDiv({ left: 50, top: 100 });
      await expect(scroll.run()).to.be.fulfilled;
      expect(offsetLeft).to.equal(50);
      expect(offsetTop).to.equal(100);
    });
  });
});
