import expect from 'expect';
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
    const input = selector<Element, HTMLInputElement>((locator, container) => {
      return container.querySelectorAll(`input[type="${locator}"]`);
    });

    useFixture('form-fixture');

    it('gets elements', async () => {
      const matches = await input('hidden', document.body);

      expect(matches).toHaveLength(2);
      expect(matches[0].getAttribute('data-test-which-input')).toEqual('second');
    });

    it('has a default error', async () => {
      try {
        await input('phone', document.body);
      } catch (err) {
        expect(err.name).toEqual('SelectorError');
        expect(err.message).toEqual('Did not find any matches with locator "phone"');
        return;
      }

      expect(false).toEqual(true);
    });
  });

  describe('complex', () => {
    useFixture('form-fixture');

    it('gets elements', async () => {
      const matches = await input('Name', document.body);

      expect(matches).toHaveLength(1);
      expect(matches[0].getAttribute('data-test-which-input')).toEqual('first');
    });

    it('errors nicely', async () => {
      try {
        await input('Phone', document.body);
      } catch (err) {
        expect(err.name).toEqual('SelectorError');
        expect(err.message).toEqual('Did not find any labels with text "Phone"');
        return;
      }

      expect(false).toEqual(true);
    });
  });

  describe('custom errors', () => {
    const input = selector<Element, HTMLInputElement>((locator, container) => {
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
        expect(err.name).toEqual('SelectorError');
        expect(err.message).toEqual('Did not find input of type "phone"');
        return;
      }

      expect(false).toEqual(true);
    });
  });
});
