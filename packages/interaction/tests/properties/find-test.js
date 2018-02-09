/* global describe, beforeEach, it, Element */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { Interaction, page, find } from '../../src';

describe('BigTest Interaction: find', () => {
  useFixture('find-fixture');

  describe('Interaction', () => {
    let interaction;

    beforeEach(() => {
      interaction = new Interaction();
    });

    it('has a find method', () => {
      expect(interaction).to.respondTo('find');
    });

    it('is immutable', () => {
      let find = interaction.find('.test-p');
      expect(find).to.not.equal(interaction);
      expect(find).to.be.an.instanceof(Interaction);
    });

    it('eventually finds the element', async () => {
      let content = '';
      let find = interaction.find('.test-p')
        .do(($test) => content = $test.innerText);

      await expect(find.run()).to.be.fulfilled;
      expect(content).to.equal('This is a test');
    });

    it('rejects when the element does not exist', async () => {
      let found = false;
      let find = interaction.find('.test-existence')
        .do(() => found = true);

      await expect(find.timeout(50).run())
        .to.be.rejectedWith('unable to find ".test-existence"');
      expect(found).to.be.false;
    });

    describe('when scoped', () => {
      useFixture('scoped-fixture');

      it('eventually finds the scoped element', async () => {
        let content = '';
        let find = new Interaction('#scoped').find('.test-p')
          .do(($p) => content = $p.innerText);

        await expect(find.run()).to.be.fulfilled;
        expect(content).to.equal('Scoped');
      });

      it('rejects when the scope does not exist', async () => {
        let found = false;
        let find = new Interaction('#scoped-existence')
          .find('.test-p')
          .do(() => found = true);

        await expect(find.timeout(50).run())
          .to.be.rejectedWith('unable to find "#scoped-existence"');
        expect(found).to.be.false;
      });
    });
  });

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.$test = find('.test-p');
          this.$noexist = find('.test-existence');
        }
      });
    });

    it('has a find method', () => {
      expect(new TestPage()).to.respondTo('find');
      expect(new TestPage().find('.test-p')).to.be.an.instanceOf(Interaction);
    });

    it('gets the element', () => {
      expect(new TestPage().$test).to.be.an.instanceOf(Element);
    });

    it('throws when the element does not exist', () => {
      expect(() => new TestPage().$noexist)
        .to.throw('unable to find ".test-existence"');
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
          .to.throw('unable to find "#scoped-existence"');
      });
    });
  });
});
