import { expect } from 'chai';
import { useFixture } from './helpers';
import { createInteractor, button } from '~';
import { when } from '~/when';

const HiddenField = createInteractor('input[type="hidden"]', elem => ({
  which() {
    return when(async () => (await elem).getAttribute('data-test-which-input'));
  }
}));

const Submit = createInteractor(button('Submit'));

const Form = createInteractor('form', elem => ({
  async submit() {
    return Submit.within(await elem)
      .first()
      .click();
  }
}));

const FormResult = createInteractor('[data-test-form-result]');

const Marquee = createInteractor('marquee');

describe('BigTest Interaction: Interactor', () => {
  useFixture('form-fixture');

  describe('#first()', () => {
    it('selects the first matching element', async () => {
      expect(await HiddenField.first().which()).to.eq('first');
    });
  });

  describe('#second()', () => {
    it('selects the first matching element', async () => {
      expect(await HiddenField.second().which()).to.eq('second');
    });
  });

  describe('#third()', () => {
    it('selects the first matching element', async () => {
      expect(await HiddenField.third().which()).to.eq('third');
    });
  });

  describe('#last()', () => {
    it('selects the first matching element', async () => {
      expect(await HiddenField.last().which()).to.eq('last');
    });
  });

  describe('action when element cannot be found', () => {
    let timeoutOG: number;

    beforeEach(() => {
      timeoutOG = when.timeout;
      when.timeout = 50;
    });

    afterEach(() => {
      when.timeout = timeoutOG;
    });

    it('rejects', async () => {
      try {
        await Marquee.first().text();
      } catch (e) {
        expect(e.message).to.eq('Result of convergence was nullish at timeout');
        return;
      }

      expect(false, 'This assertion should not be executed').to.be.true;
    });
  });

  describe('composition', () => {
    beforeEach(async () => {
      await Form.first().submit();
    });

    it('works', async () => {
      expect(await FormResult.first().text()).to.eq('ok');
    });
  });
});
