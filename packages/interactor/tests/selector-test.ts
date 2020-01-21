import { expect } from 'chai';
import { useFixture } from './helpers';
import { selector } from '~';
import { throwIfEmpty } from '~/util';

describe('selector()', () => {
  describe('basics', () => {
    const input = selector((container, locator) => {
      return container.querySelectorAll(`input[type="${locator}"]`);
    });

    useFixture('form-fixture');

    it('gets elements', async () => {
      const matches = await input(document.body, 'hidden');

      expect(matches).to.have.lengthOf(3);
      expect(matches[0].getAttribute('data-test-which-input')).to.eq('first');
    });

    it('has a default error', async () => {
      try {
        await input(document.body, 'phone');
      } catch (err) {
        expect(err.name).to.eq('SelectorError');
        expect(err.message).to.eq('Did not find any matches with locator "phone"');
        return;
      }

      expect(false, 'Should not get here').to.be.true;
    });
  });

  describe('custom errors', () => {
    const input = selector((container, locator) => {
      return throwIfEmpty(
        container.querySelectorAll(`input[type="${locator}"]`),
        `Did not find input of type "${locator}"`
      );
    });

    useFixture('form-fixture');

    it('surfaces custom errors', async () => {
      try {
        await input(document.body, 'phone');
      } catch (err) {
        expect(err.name).to.eq('SelectorError');
        expect(err.message).to.eq('Did not find input of type "phone"');
        return;
      }

      expect(false, 'Should not get here').to.be.true;
    });
  });
});
