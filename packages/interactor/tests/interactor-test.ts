import expect from 'expect';
import { it } from './helpers/it';
import { useFixture } from './helpers/useFixture';
import { interactor } from '~';
import { button, css, inputByType, input } from './helpers/selectors';

describe('interactor()', () => {
  const Element = interactor(css, ({ subject }) => ({
    get text() {
      return subject.first.then(elem => elem.innerText);
    }
  }));
  const Button = interactor(button, ({ subject }) => ({
    async press() {
      const elem = await subject.first;
      elem.click();
    }
  }));
  const Input = interactor(input, ({ subject }) => {
    return {
      get value() {
        return subject.first.then(elem => elem.value);
      },
      async fill(val: string) {
        const elem = await subject.first;
        elem.value = val;
      },
      async upcase() {
        const elem = await subject.first;
        elem.value = elem.value.toUpperCase();
      }
    };
  });

  useFixture('form-fixture');

  describe('basics', () => {
    beforeEach(() => Button('Submit').press());

    it('works', async () => {
      await expect(Element('#result').text).resolves.toEqual('ok');
    });
  });

  describe('custom actions', () => {
    beforeEach(() => Button('Submit').press());

    it('works', async () => {
      await expect(Element('#result').text).resolves.toEqual('ok');
    });
  });

  describe('multiple matches', () => {
    const Input = interactor(inputByType, ({ subject }) => ({
      get values() {
        return subject.all.then(elems => Promise.all(elems.map(el => el.value)));
      }
    }));

    it('works', async () => {
      await expect(Input('hidden').values).resolves.toEqual(['foo', 'bar']);
    });
  });

  describe('chaining', () => {
    beforeEach(() =>
      Input('Name')
        .fill('foo')
        .fill('bar')
        .upcase()
    );

    it('works', async () => {
      await expect(Input('Name').value).resolves.toEqual('BAR');
    });
  });

  describe('slow action', () => {
    const SlowInput = interactor(input, ({ subject }) => {
      return {
        get value() {
          return subject.first.then(elem => elem.value);
        },
        async fill(val: string) {
          const elem = await subject.first;
          elem.value = val;
        },
        async upcase() {
          const elem = await subject.first;
          await new Promise(resolve => {
            setTimeout(resolve, 200);
          });
          elem.value = elem.value.toUpperCase();
        }
      };
    });

    beforeEach(() =>
      SlowInput('Name')
        .fill('foo')
        .upcase()
    );

    it('works', async () => {
      await expect(SlowInput('Name').value).resolves.toEqual('FOO');
    });
  });

  describe('complex interactor', () => {
    const SomeForm = interactor(
      css,
      ({ subject }) => {
        return {
          async submit() {
            await Button('Submit', subject).press();
          },
          get result() {
            return Element('#result', subject).text;
          }
        };
      },
      { locator: '[data-test-form-wrapper]' }
    );

    beforeEach(() => SomeForm().submit());

    it('works', async () => {
      await expect(SomeForm().result).resolves.toEqual('ok');
    });
  });
});
