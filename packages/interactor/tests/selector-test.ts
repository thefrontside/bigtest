import { expect } from 'chai';
import { useFixture } from './helpers';
import { selector } from '~';
import { when } from '~/when';

function elementIsInput(elem: any): elem is HTMLInputElement {
  return typeof elem.value === 'string';
}

describe('selector()', () => {
  useFixture('form-fixture');

  describe('basics', () => {
    const input = selector(({ element, locator }) => {
      const result = element.querySelector(`input[type="${locator}"]`);

      if (elementIsInput(result)) {
        return result;
      }

      throw new Error('💥');
    });

    it('gets the first element', async () => {
      const { element, locator } = input({ element: Promise.resolve(document.body), locator: 'hidden' });

      expect((await element).getAttribute('data-test-which-input')).to.eq('first');
      expect(locator).to.eq('hidden');
    });

    it('can get a different element other than the first', async () => {
      const { element, locator } = input({
        element: Promise.resolve(document.body),
        locator: 'hidden'
      });

      expect((await element).getAttribute('data-test-which-input')).to.eq('second');
      expect(locator).to.eq('hidden');
    });
  });
});
