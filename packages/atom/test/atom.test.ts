import { describe, it } from 'mocha';
import * as expect from 'expect';
import { Atom } from '../src/atom';
import { spawn, when, never } from './helpers';
import { Slice } from '../src/slice';
import { Subscription, subscribe, ChainableSubscription } from '@effection/subscription';

type Subject = {
  foo: string;
}

describe.only('@bigtest/atom', () => {
  describe('Atom', () => {
    let subject: Atom<Subject>;

    beforeEach(() => {
      subject = new Atom({foo: 'bar'});
    })

    describe('.get()', () => {
      it('gets the current state', () => {
        expect(subject.get().foo).toEqual('bar');
      });
    });

    describe('.update()', () => {
      beforeEach(() => {
        subject.update(previous => {
          expect(previous).toEqual({ foo: 'bar' });
          return { foo: 'baz' };
        });
      });

      it('updates the current state', () => {
        expect(subject.get().foo).toEqual('baz');
      });
    });

    describe('.once()', () => {
      let result: Promise<Subject>;

      describe('when initial state matches', () => {
        beforeEach(async () => {
          result = spawn(subject.once((state) => state.foo === 'bar'));

          subject.update(() => ({ foo: 'baz' }));
        });

        it('gets the first state that passes the given predicate', async () => {
          expect(await result).toEqual({ foo: 'bar' });
          expect(subject.get()).toEqual({ foo: 'baz' });
        });
      });

      describe('when initial state does not match', () => {
        beforeEach(async () => {
          result = spawn(subject.once((state) => state.foo === 'baz'));

          subject.update(() => ({ foo: 'bar' }));
          subject.update(() => ({ foo: 'baz' }));
          subject.update(() => ({ foo: 'quox' }));
        });

        it('gets the first state that passes the given predicate', async () => {
          expect(await result).toEqual({ foo: 'baz' });
          expect(subject.get()).toEqual({ foo: 'quox' });
        });
      });
    });

    describe.only('.reset()', () => {
      describe('without an initializer', () => {
        beforeEach(async () => {
          subject.update(() => ({ foo: 'baz'}));

          subject.reset();
        });

        it('resets to the initial value', async () => {
          expect(subject.get()).toEqual({ foo: 'bar' });
        });
      });

      describe.skip('with an initializer', () => {
        let initializerArgs: Subject[];

        beforeEach(async () => {
          subject.update(() => ({ foo: 'bar' }));

          subject.reset((initial, current) => {
            initializerArgs = [initial, current];
            return { foo: 'baz'};
          });
        });

        it('resets to the value returned from the given function', async () => {
          expect(subject.get()).toEqual({ foo: 'baz' });
        });

        it('provides the initial and current values as arguments to the given function', async () => {
          expect(initializerArgs).toEqual([{ foo: 'bar' }, { foo: 'baz' }]);
        });
      });

      describe('removing listeners', () => {
        let result: Subject[];

        beforeEach(async () => {
          result = [];

          let subscription = await spawn(subscribe(subject));
          spawn(subscription.forEach(function*(state) { result.push(state); }));

          subject.update(() => ({ foo: 'state before reset' }));
          subject.reset(() => ({ foo: 'reset state' }));
          subject.update(() => ({ foo: 'state after reset' }));
        });

        it('emits state changes to listeners before reset', async () => {
          await when(() => {
            expect(result).toEqual([{ foo: 'state before reset' }]);
          });
        });

        it('stops emitting changes to listeners set before reset', async () => {
          await never(() => {
            expect(result).toEqual([{ foo: 'state before reset' }, { foo: 'state after reset' }]);
          });
        });
      });
    });

    describe.only('.slice()', () => {
      interface Foo {
        foo: {
          bar: string;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        [key: string]: any;
      }
      let subject: Atom<Foo>;
      let result: Slice<string, Foo>;

      beforeEach(async () => {
        subject = new Atom({ foo: { bar: "baz" } });
        result = subject.slice()('foo', 'bar');
      });

      it('returns a slice of the Atom with the given path', async () => {
        expect(result.get()).toEqual('baz');
      });
    });

    describe('subscribe', () => {
      let subscription: Subscription<Subject, undefined>;

      beforeEach(async () => {
        subscription = await spawn(subscribe(subject));

        subject.update(() => ({ foo: 'bar' }));
        subject.update(() => ({ foo: 'baz' }));
        subject.update(() => ({ foo: 'quox' }));
      });

      it('iterates over emitted states', async () => {
        await expect(spawn(subscription.next())).resolves.toEqual({ done: false, value: 'bar' });
        await expect(spawn(subscription.next())).resolves.toEqual({ done: false, value: 'baz' });
        await expect(spawn(subscription.next())).resolves.toEqual({ done: false, value: 'quox' });
      });
    });

    describe.only('subscribe - unique state publish', () => {
      let result: Subject[];
      let subscription: ChainableSubscription<Subject, undefined>;

      beforeEach(async () => {
        result = [];

        subscription = await spawn(subscribe(subject));
        spawn(subscription.forEach(function*(state) { 
          result.push(state); 
        }));

        // foo is the initial value
        // should not appear as element 1 in the result
        subject.update(() => ({ foo: 'foo' }));
        subject.update(() => ({ foo: 'bar' }));
        subject.update(() => ({ foo: 'bar' }));
        subject.update(() => ({ foo: 'baz' }));
        subject.update(() => ({ foo: 'baz' }));
        // back to foo, should exist in the result
        subject.update(() => ({ foo: 'foo' }));
      });

      it('should only publish unique state changes', async () => {
        await when(() => {
          expect(result).toHaveLength(3);
          expect(result).toEqual(['bar', 'baz', 'foo']);
        });
      });
    });
  });
});
