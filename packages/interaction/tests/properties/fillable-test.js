/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { Interaction, page, fillable } from '../../src';

describe('BigTest Interaction: fillable', () => {
  let value = '';
  let events = [];

  useFixture('input-fixture');

  beforeEach(() => {
    events = [];

    let $input = document.querySelector('.test-input');

    $input.addEventListener('input', () => {
      events.push('input');
    });

    $input.addEventListener('change', function() {
      events.push('change');
      value = this.value;
    });
  });

  describe('Interaction', () => {
    let interaction;

    beforeEach(() => {
      interaction = new Interaction();
    });

    it('has a fill method', () => {
      expect(interaction).to.respondTo('fill');
    });

    it('is immutable', () => {
      let fill = interaction.fill('.test-input', '');
      expect(fill).to.not.equal(interaction);
      expect(fill).to.be.an.instanceof(Interaction);
    });

    it('eventually fills the scoped element', async () => {
      let fill = new Interaction('.test-input').fill('hello scope');
      await expect(fill.run()).to.be.fulfilled;
      expect(value).to.equal('hello scope');
    });

    it('eventually fills the element', async () => {
      let fill = interaction.fill('.test-input', 'hello world');
      await expect(fill.run()).to.be.fulfilled;
      expect(value).to.equal('hello world');
    });

    it('eventually fires input and change events', async () => {
      let fill = interaction.fill('.test-input', '');
      await expect(fill.run()).to.be.fulfilled;
      expect(events).to.have.members(['input', 'change']);
    });
  });

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.fillInput = fillable('.test-input');
        }
      });
    });

    it('has a fill method', () => {
      expect(new TestPage()).to.respondTo('fill');
    });

    it('has a custom fillable method', () => {
      expect(new TestPage()).to.respondTo('fillInput');
    });

    it('returns a custom interaction', () => {
      let fill = new TestPage().fillInput('');
      expect(fill).to.be.an.instanceOf(TestPage.Interaction);
      expect(fill).to.be.an.instanceOf(Interaction);
    });

    it('has a chainable interface', () => {
      let fill = new TestPage().fillInput('');
      expect(fill.fillInput).to.be.a('function');
    });

    it('eventually fills a given input element', async () => {
      let fill = new TestPage().fill('.test-input', 'given');
      await expect(fill.run()).to.be.fulfilled;
      expect(value).to.equal('given');
    });

    it('eventually fills the specified input element', async () => {
      let fill = new TestPage().fillInput('specified');
      await expect(fill.run()).to.be.fulfilled;
      expect(value).to.equal('specified');
    });

    it('eventually fires input and change events', async () => {
      let fill = new TestPage().fillInput('filled');
      await expect(fill.run()).to.be.fulfilled;
      expect(events).to.have.members(['input', 'change']);
    });
  });
});
