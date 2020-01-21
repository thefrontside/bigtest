import { expect } from 'chai';
import { useFixture } from './helpers';
import { selector } from '~';

describe('selector()', () => {
  useFixture('form-fixture');

  describe('basics', () => {
    const input = selector(({ container, locator }) => {
      return container.querySelectorAll(`input[type="${locator}"]`);
    });

    it('gets the first element', async () => {
      const { matches, locator } = await input({
        containers: [document.body],
        locator: 'hidden'
      });

      expect(matches[0].getAttribute('data-test-which-input')).to.eq('first');
      expect(locator).to.eq('hidden');
    });

    it('can get a different element other than the first', async () => {});
  });
});
