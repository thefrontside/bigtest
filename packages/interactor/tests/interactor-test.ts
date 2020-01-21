import { expect } from 'chai';
import { useFixture } from './helpers';
import { selector, interactor } from '~';
import { throwIfEmpty, compact } from '~/util';
import { button } from '~/selectors/button';
import { css } from '~/selectors/css';

describe('interactor()', () => {
  const Button = interactor(button, ({ subject }) => ({
    async press() {
      await subject.first().click();
    }
  }));
  const Element = interactor(css);

  describe('basics', () => {
    useFixture('form-fixture');

    it('works', async () => {
      expect(await Element('#result').getText()).to.eq('not ok');
      await Button('Submit').click();
      expect(await Element('#result').getText()).to.eq('ok');
    });

    it('has custom actions', async () => {
      expect(await Element('#result').getText()).to.eq('not ok');
      await Button('Submit').press();
      expect(await Element('#result').getText()).to.eq('ok');
    });
  });
});
