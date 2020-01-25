import expect from 'expect';
import { it } from './helpers/it';
import { useFixture } from './helpers/useFixture';
import { interactor } from '~';
import { button, css, inputByType, input } from './helpers/selectors';
import { SelectorError } from '~/util';
import { when } from '~/when';
import { sleep } from './helpers/sleep';

describe('interactor()', () => {
  const Element = interactor(css, ({ subject }) => {
    return {
      get text() {
        return subject.first.then(elem => elem.innerText);
      }
    };
  });
  const Button = interactor(button, ({ subject }) => {
    return {
      async press() {
        const elem = await subject.first;
        elem.click();
      }
    };
  });
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
          await sleep(200);
          elem.value = val;
        }
      };
    });

    beforeEach(() => SlowInput('Name').fill('foo'));

    it('works', async () => {
      await expect(SlowInput('Name').value).resolves.toEqual('foo');
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

  describe('errors', () => {
    describe('selector errors', () => {
      let timeoutOG = when.timeout;

      before(() => {
        when.timeout = 50;
      });

      after(() => {
        when.timeout = timeoutOG;
      });

      it('surfaces selector errors', async () => {
        await expect(Element('foo').text).rejects.toEqual(
          new SelectorError('Did not find any matches with locator "foo"')
        );
      });
    });

    describe('action errors', () => {
      const Input = interactor(input, () => {
        return {
          boom() {
            throw new Error('💥');
          }
        };
      });

      beforeEach(() => expect(Input('Name').boom()).rejects.toEqual(new Error('💥')));

      it('surfaces action errors', () => {
        // We're testing an action, not a resultant state, so nothing needs to go here
      });
    });

    describe('action return values', () => {
      const Input = interactor(input, () => {
        return {
          bam() {
            return 'henlo' as any;
          }
        };
      });

      beforeEach(() =>
        expect(Input('Name').bam()).rejects.toEqual(
          new TypeError('Your action returned a value; please use a computed property instead')
        )
      );

      it('throws an error', () => {
        // We're testing an action, not a resultant state, so nothing needs to go here
      });
    });
  });
});
