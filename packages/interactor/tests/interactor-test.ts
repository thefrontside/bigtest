import { expect } from 'chai';
import { useFixture } from './helpers';
import { createInteractor, button } from '~';
import { when } from '~/when';

const Input = createInteractor('input', elem => ({
  async which() {
    return (await elem).getAttribute('data-test-which-input');
  }
}));

const Submit = createInteractor(button('Submit'));

const Form = createInteractor('form', elem => ({
  async submit() {
    const ThisSubmit = Submit.within(await elem);
    return ThisSubmit().click();
  }
}));

const FormResult = createInteractor('[data-test-form-result]');

const Marquee = createInteractor('marquee');

describe('BigTest Interaction: Interactor', () => {
  useFixture('form-fixture');

  it('selects the first matching element', async () => {
    expect(await Input().which()).to.eq('first');
  });

  it('selects the second matching element', async () => {
    expect(await Input(1).which()).to.eq('second');
  });

  describe('#where', () => {
    it('uses the given selector instead', async () => {
      const HiddenInput = Input.where('input[type="hidden"]');
      expect(await HiddenInput().which()).to.eq('first');
    });
  });

  describe('#within', () => {
    it('looks within the given element', async () => {
      const InputOfFirstForm = Input.within(await Form().$());
      expect(await InputOfFirstForm().which()).to.eq('first');
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
        await Marquee().text();
      } catch (e) {
        expect(e.message).to.eq('Could not find "marquee"');
        return;
      }

      expect(false, 'This assertion should not be executed').to.be.true;
    });
  });

  describe('composition', () => {
    beforeEach(async () => {
      await Form().submit();
    });

    it('works', async () => {
      expect(await FormResult().text()).to.eq('ok');
    });
  });
});
