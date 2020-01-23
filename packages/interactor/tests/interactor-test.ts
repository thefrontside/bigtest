import { expect } from 'chai';
import { it } from './helpers/it';
import { useFixture } from './helpers/useFixture';
import { interactor } from '~';
import { button, css, inputByType, input } from './helpers/selectors';

describe('interactor()', () => {
  const Element = interactor(css);
  const Button = interactor(button, ({ subject }) => ({
    async press() {
      await subject.first().click();
    }
  }));

  useFixture('form-fixture');

  describe('basics', () => {
    beforeEach(() => Button('Submit').press());
    it('works', async () => expect(await Element('#result').text).to.eq('ok'));
  });

  describe('custom actions', () => {
    beforeEach(() => Button('Submit').press());
    it('has custom actions', async () => expect(await Element('#result').text).to.eq('ok'));
  });

  describe('multiple matches', () => {
    const Input = interactor(inputByType, ({ subject }) => ({
      get values() {
        return subject.all().then(elems => Promise.all(elems.map(el => el.value)));
      }
    }));

    it('works', async () => expect(await Input('hidden').values).to.deep.eq(['foo', 'bar']));
  });

  describe('chaining', () => {
    const Input = interactor(input, ({ subject }) => ({
      async upcase() {
        const og = await subject.first().value;
        await subject.first().fill(og.toUpperCase());
      }
    }));

    beforeEach(() =>
      Input('Name')
        .fill('foo')
        .fill('bar')
        .upcase()
    );

    it('works', async () => expect(await Input('Name').value).to.eq('BAR'));
  });

  describe('slow action', () => {
    const Input = interactor(input, ({ subject }) => ({
      async upcase() {
        const og = await subject.first().value;
        await new Promise(resolve => {
          setTimeout(resolve, 200);
        });
        await subject.first().fill(og.toUpperCase());
      }
    }));

    beforeEach(() =>
      Input('Name')
        .fill('foo')
        .upcase()
    );

    it('works', async () => expect(await Input('Name').value).to.eq('FOO'));
  });

  describe('complex interactor', () => {
    const SomeForm = interactor(
      css,
      ({ subject }) => ({
        async submit() {
          await Button('Submit', subject).press();
        },
        get result() {
          return Element('#result').text;
        }
      }),
      { locator: 'form' }
    );

    beforeEach(() => SomeForm().submit());

    it('works', async () => expect(await SomeForm().result).to.eq('ok'));
  });
});
