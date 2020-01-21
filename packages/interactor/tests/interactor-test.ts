import { expect } from 'chai';
import { useFixture } from './helpers';
import { selector, interactor } from '~';
import { throwIfEmpty, compact } from '~/util';

describe('interactor()', () => {
  describe('basics', () => {
    const css = selector((container, locator) => container.querySelectorAll(locator));
    const button = selector((container, locator) =>
      Array.from(container.querySelectorAll('button')).filter(btn => btn.innerText === locator)
    );
    const Button = interactor(button);
    const Element = interactor(css);

    useFixture('form-fixture');

    it('gets elements', async () => {
      expect(await Element('#result').getText()).to.eq('not ok');
      await Button('Submit').click();
      expect(await Element('#result').getText()).to.eq('ok');
    });
  });
});
