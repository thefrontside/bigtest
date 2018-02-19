/* global describe, beforeEach, it, Element */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { Interaction, page, findAll } from '../../src';

describe('BigTest Interaction: findAll', () => {
  useFixture('find-fixture');

  describe('Interaction', () => {
    let interaction;

    beforeEach(() => {
      interaction = new Interaction();
    });

    it('has a findAll method', () => {
      expect(interaction).to.respondTo('findAll');
    });

    it('is immutable', () => {
      let findAll = interaction.findAll('.test-p');
      expect(findAll).to.not.equal(interaction);
      expect(findAll).to.be.an.instanceof(Interaction);
    });

    it('eventually finds all elements', async () => {
      let length = 0;
      let findAll = interaction.findAll('.test-p')
        .do((tests) => length = tests.length);

      await expect(findAll.run()).to.be.fulfilled;
      expect(length).to.equal(2);
    });

    it('is an empty array when elements do not exist', async () => {
      let found = null;
      let findAll = interaction.findAll('.test-existence')
        .do((test) => found = test);

      await expect(findAll.run()).to.be.fulfilled;
      expect(found).to.be.an('Array').with.lengthOf(0);
    });

    describe('when scoped', () => {
      useFixture('scoped-fixture');

      it('eventually finds the scoped elements', async () => {
        let length = 0;
        let findAll = new Interaction('#scoped').findAll('.test-p')
          .do((tests) => length = tests.length);

        await expect(findAll.run()).to.be.fulfilled;
        expect(length).to.equal(1);
      });

      it('rejects when the scope does not exist', async () => {
        let found = false;
        let findAll = new Interaction('#scoped-existence')
          .findAll('.test-p')
          .do(() => found = true);

        await expect(findAll.timeout(50).run())
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
          this.tests = findAll('.test-p');
          this.noexist = findAll('.test-existence');
        }
      });
    });

    it('has a findAll method', () => {
      expect(new TestPage()).to.respondTo('findAll');
      expect(new TestPage().findAll('.test-p')).to.be.an.instanceOf(Interaction);
    });

    it('gets the elements', () => {
      expect(new TestPage().tests).to.be.an('Array').with.lengthOf(2);
    });

    it('returns an empty when the elements do not exist', () => {
      expect(new TestPage().noexist).to.be.an('Array').with.lengthOf(0);
    });

    describe('when scoped', () => {
      useFixture('scoped-fixture');

      it('gets scoped elements', () => {
        let $el = new TestPage('#scoped').tests[0];
        expect($el).to.be.an.instanceOf(Element);
        expect($el.innerText).to.equal('Scoped');
      });

      it('throws when the scope does not exist', () => {
        expect(() => new TestPage('#scoped-existence').tests)
          .to.throw('unable to find "#scoped-existence"');
      });
    });
  });
});
