/* global describe, beforeEach, it, Element */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { Interaction, page, select } from '../../src';

describe('BigTest Interaction: select', () => {
  useFixture('select-fixture');

  describe('Interaction', () => {
    let interaction;

    beforeEach(() => {
      interaction = new Interaction();
    });

    it('has a select method', () => {
      expect(interaction).to.respondTo('select');
    });

    it('is immutable', () => {
      let select = interaction.select('.test-p');
      expect(select).to.not.equal(interaction);
      expect(select).to.be.an.instanceof(Interaction);
    });

    it('eventually selects the element', async () => {
      let content = '';
      let select = interaction.select('.test-p')
        .do(($test) => content = $test.innerText);

      await expect(select.run()).to.be.fulfilled;
      expect(content).to.equal('This is a test');
    });

    it('rejects when the element does not exist', async () => {
      let selected = false;
      let select = interaction.select('.test-existence')
        .do(() => selected = true);

      await expect(select.timeout(50).run())
        .to.be.rejectedWith('unable to select ".test-existence"');
      expect(selected).to.be.false;
    });

    describe('when scoped', () => {
      useFixture('scoped-fixture');

      it('eventually selects the scoped element', async () => {
        let content = '';
        let select = new Interaction('#scoped').select('.test-p')
          .do(($p) => content = $p.innerText);

        await expect(select.run()).to.be.fulfilled;
        expect(content).to.equal('Scoped');
      });

      it('rejects when the scope does not exist', async () => {
        let selected = false;
        let select = new Interaction('#scoped-existence')
          .select('.test-p')
          .do(() => selected = true);

        await expect(select.timeout(50).run())
          .to.be.rejectedWith('unable to select "#scoped-existence"');
        expect(selected).to.be.false;
      });
    });
  });

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.$test = select('.test-p');
          this.$noexist = select('.test-existence');
        }
      });
    });

    it('has a select method', () => {
      expect(new TestPage()).to.respondTo('select');
      expect(new TestPage().select('.test-p')).to.be.an.instanceOf(Interaction);
    });

    it('gets the element', () => {
      expect(new TestPage().$test).to.be.an.instanceOf(Element);
    });

    it('throws when the element does not exist', () => {
      expect(() => new TestPage().$noexist)
        .to.throw('unable to select ".test-existence"');
    });

    describe('when scoped', () => {
      useFixture('scoped-fixture');

      it('gets the scoped element', () => {
        let $el = new TestPage('#scoped').$test;
        expect($el).to.be.an.instanceOf(Element);
        expect($el.innerText).to.equal('Scoped');
      });

      it('throws when the scope does not exist', () => {
        expect(() => new TestPage('#scoped-existence').$test)
          .to.throw('unable to select "#scoped-existence"');
      });
    });
  });
});
