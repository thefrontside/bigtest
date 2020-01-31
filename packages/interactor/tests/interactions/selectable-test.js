/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, selectable } from '../../src';

@interactor class SelectInteractor {
  selectOption = selectable('.test-select');
}

describe('BigTest Interaction: selectable', () => {
  let test, $select, events;

  describe('with a single select', () => {
    useFixture('select-fixture');

    beforeEach(() => {
      events = [];
      $select = document.querySelector('.test-select');
      $select.addEventListener('input', () => events.push('input'));
      $select.addEventListener('change', () => events.push('change'));
      test = new SelectInteractor();
    });

    it('has selectable methods', () => {
      expect(test).to.respondTo('select');
      expect(test).to.respondTo('selectOption');
    });

    it('returns a new instance', () => {
      expect(test.select('.test-select')).to.not.equal(test);
      expect(test.select('.test-select')).to.be.an.instanceOf(SelectInteractor);
      expect(test.selectOption('Option 1')).to.not.equal(test);
      expect(test.selectOption('Option 1')).to.be.an.instanceOf(SelectInteractor);
    });

    it('eventually selects the option', async () => {
      await expect(test.select('.test-select', 'Option 1').run()).to.be.fulfilled;
      expect($select.value).to.equal('1');

      $select.value = '';
      await expect(test.selectOption('Option 2').run()).to.be.fulfilled;
      expect($select.value).to.equal('2');
    });

    it('eventually fires a change event', async () => {
      await expect(test.select('.test-select', 'Option 1').run()).to.be.fulfilled;
      expect(events).to.have.members(['input', 'change']);

      events = [];
      await expect(test.selectOption('Option 2').run()).to.be.fulfilled;
      expect(events).to.have.members(['input', 'change']);
    });

    it('throws an error when the option cannot be found', async () => {
      await expect(
        test
          .selectOption('nothing')
          .timeout(50)
          .run()
      ).to.be.rejectedWith('unable to find option "nothing"');
    });

    it('can not pass multiple options', async () => {
      await expect(
        test
          .timeout(50)
          .select('.test-select', ['Option 1', 'Option 2'])
          .run()
      ).to.be.rejectedWith('unable to select more than one option for ".test-select"');
    });

    describe('overwriting the default select method', () => {
      beforeEach(() => {
        test = new (@interactor class {
          select = selectable('.test-select');
        })();
      });

      it('selects the correct option', async () => {
        await expect(test.select('Option 3').run()).to.be.fulfilled;
        expect($select.value).to.equal('3');
      });
    });
  });

  describe('with a multiselect', () => {
    useFixture('multiselect-fixture');

    beforeEach(() => {
      $select = document.querySelector('.test-select');
      test = new SelectInteractor();
    });

    it('can deselect currently selected options', async () => {
      await expect(test.select('.test-select', ['Option 1', 'Option 2']).run()).to.be.fulfilled;
      expect($select.selectedOptions.length).to.equal(2);
      expect($select.selectedOptions[0].text).to.equal('Option 1');
      expect($select.selectedOptions[1].text).to.equal('Option 2');

      await expect(test.selectOption('Option 2').run()).to.be.fulfilled;
      expect($select.selectedOptions.length).to.equal(1);
      expect($select.selectedOptions[0].text).to.equal('Option 1');
    });

    it('can deselect all options', async () => {
      await expect(test.select('.test-select', ['Option 1', 'Option 2']).run()).to.be.fulfilled;
      expect($select.selectedOptions.length).to.equal(2);
      expect($select.selectedOptions[0].text).to.equal('Option 1');
      expect($select.selectedOptions[1].text).to.equal('Option 2');

      await expect(test.select('.test-select', ['Option 1', 'Option 2']).run()).to.be.fulfilled;
      expect($select.selectedOptions.length).to.equal(0);
    });

    it('can pass multiple options to be selected', async () => {
      await expect(test.select('.test-select', ['Option 1', 'Option 2']).run()).to.be.fulfilled;
      expect($select.selectedOptions.length).to.equal(2);
      expect($select.selectedOptions[0].text).to.equal('Option 1');
      expect($select.selectedOptions[1].text).to.equal('Option 2');
    });

    it('can pass multiple options to be selected on a custom element', async () => {
      await expect(test.selectOption(['Option 1', 'Option 2']).run()).to.be.fulfilled;
      expect($select.selectedOptions.length).to.equal(2);
      expect($select.selectedOptions[0].text).to.equal('Option 1');
      expect($select.selectedOptions[1].text).to.equal('Option 2');
    });

    it('throws an error when trying to select an option that does not exist', async () => {
      await expect(test.timeout(50).selectOption(['Option 1', 'Race car']).run())
        .to.be.rejectedWith('unable to find option "Race car"');
    });
  });
});
