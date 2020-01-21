import { expect } from 'chai';
import { useFixture } from './helpers/useFixture';
import { selector } from '~';
import { throwIfEmpty } from '~/util';
import { input } from './helpers/selectors';
import { when } from '~/when';

describe('selector()', () => {
  let timeoutOG = when.timeout;

  before(() => {
    when.timeout = 50;
  });

  after(() => {
    when.timeout = timeoutOG;
  });

  describe('basics', () => {
    const input = selector((locator, container) => {
      return container.querySelectorAll(`input[type="${locator}"]`);
    });

    useFixture('form-fixture');

    it('gets elements', async () => {
      const matches = await input('hidden', document.body);

      expect(matches).to.have.lengthOf(2);
      expect(matches[0].getAttribute('data-test-which-input')).to.eq('second');
    });

    it('has a default error', async () => {
      try {
        await input('phone', document.body);
      } catch (err) {
        expect(err.name).to.eq('SelectorError');
        expect(err.message).to.eq('Did not find any matches with locator "phone"');
        return;
      }

      expect(false, 'Should not get here').to.be.true;
    });
  });

  describe('complex', () => {
    useFixture('form-fixture');

    it('gets elements', async () => {
      const matches = await input('Name', document.body);

      expect(matches).to.have.lengthOf(1);
      expect(matches[0].getAttribute('data-test-which-input')).to.eq('first');
    });

    it('errors nicely', async () => {
      try {
        await input('Phone', document.body);
      } catch (err) {
        expect(err.name).to.eq('SelectorError');
        expect(err.message).to.eq('Did not find any labels with text "Phone"');
        return;
      }

      expect(false, 'Should not get here').to.be.true;
    });
  });

  describe('custom errors', () => {
    const input = selector((locator, container) => {
      return throwIfEmpty(
        container.querySelectorAll(`input[type="${locator}"]`),
        `Did not find input of type "${locator}"`
      );
    });

    useFixture('form-fixture');

    it('surfaces custom errors', async () => {
      try {
        await input('phone', document.body);
      } catch (err) {
        expect(err.name).to.eq('SelectorError');
        expect(err.message).to.eq('Did not find input of type "phone"');
        return;
      }

      expect(false, 'Should not get here').to.be.true;
    });
  });
});
