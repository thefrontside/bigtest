import { expect } from 'chai';
import { useFixture } from './helpers';
import { selector, interactor } from '~';

const button = selector((locator, container) =>
  Array.from(container.querySelectorAll('button')).filter(btn => btn.innerText === locator)
);
const css = selector((locator, container) => container.querySelectorAll(locator));
const inputByType = selector((locator, container) => container.querySelectorAll(`input[type="${locator}"]`));

describe('interactor()', () => {
  describe('basics', () => {
    const Button = interactor(button, ({ subject }) => ({
      async press() {
        await subject.first().click();
      }
    }));
    const Element = interactor(css);

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

  describe('multiple matches', () => {
    const Input = interactor(inputByType, ({ subject }) => ({
      async getValues() {
        const elems = await subject.all();
        return Promise.all(elems.map(el => el.getValue()));
      }
    }));

    useFixture('form-fixture');

    it('works', async () => {
      expect(await Input('hidden').getValues()).to.deep.eq(['foo', 'bar']);
    });
  });
});
