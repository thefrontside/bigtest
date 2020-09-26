import { describe, it } from 'mocha';
import * as expect from 'expect';
import { Atom } from '../src/atom';
import { spawn, when, never } from './helpers';
import { Slice } from '../src/slice';
import { Subscription, subscribe, ChainableSubscription } from '@effection/subscription';

describe('@bigtest/atom', () => {
  describe('Atom', () => {
    let subject: Atom<string>;

    beforeEach(() => {
      subject = new Atom('foo');
    })

    describe('.get()', () => {
      it('gets the current state', () => {
        expect(subject.get()).toEqual('foo');
      });
    });

    describe('.update()', () => {
      beforeEach(() => {
        subject.update(previous => {
          expect(previous).toEqual('foo');
          return 'bar';
        });
      });

      it('updates the current state', () => {
        expect(subject.get()).toEqual('bar');
      });
    });

    describe('.once()', () => {
      let result: Promise<string | undefined>;

      describe('when initial state matches', () => {
        beforeEach(async () => {
          result = spawn(subject.once((state) => state === 'foo'));

          subject.update(() => 'bar');
        });

        it('gets the first state that passes the given predicate', async () => {
          expect(await result).toEqual('foo');
          expect(subject.get()).toEqual('bar');
        });
      });

      describe('when initial state does not match', () => {
        beforeEach(async () => {
          result = spawn(subject.once((state) => state === 'baz'));

          subject.update(() => 'bar');
          subject.update(() => 'baz');
          subject.update(() => 'quox');
        });

        it('gets the first state that passes the given predicate', async () => {
          expect(await result).toEqual('baz');
          expect(subject.get()).toEqual('quox');
        });
      });
    });

    describe('.reset()', () => {
      describe('without an initializer', () => {
        beforeEach(async () => {
          subject.update(() => 'bar');

          subject.reset();
        });

        it('resets to the initial value', async () => {
          expect(subject.get()).toEqual('foo');
        });
      });

      describe('with an initializer', () => {
        let initializerArgs: string[];

        beforeEach(async () => {
          subject.update(() => 'bar');

          subject.reset((initial, current) => {
            initializerArgs = [initial, current];
            return 'baz';
          });
        });

        it('resets to the value returned from the given function', async () => {
          expect(subject.get()).toEqual('baz');
        });

        it('provides the initial and current values as arguments to the given function', async () => {
          expect(initializerArgs).toEqual(['foo', 'bar']);
        });
      });

      describe('removing listeners', () => {
        let result: string[];

        beforeEach(async () => {
          result = [];

          let subscription = await spawn(subscribe(subject));
          spawn(subscription.forEach(function*(state) { result.push(state); }));

          subject.update(() => 'state before reset');
          subject.reset(() => 'reset state');
          subject.update(() => 'state after reset');
        });

        it('emits state changes to listeners before reset', async () => {
          await when(() => {
            expect(result).toEqual(['state before reset']);
          });
        });

        it('stops emitting changes to listeners set before reset', async () => {
          await never(() => {
            expect(result).toEqual(['state before reset', 'state after reset']);
          });
        });
      });
    });

    describe('.slice()', () => {
      interface Foo {
        foo: {
          bar: string;
        };
      }
      let subject: Atom<Foo>;
      let result: Slice<string, Foo>;

      beforeEach(async () => {
        subject = new Atom({ foo: { bar: "baz" } });
        result = subject.slice('foo', 'bar');
      });

      it('returns a slice of the Atom with the given path', async () => {
        expect(result.get()).toEqual('baz');
      });
    });

    describe('subscribe', () => {
      let subscription: Subscription<string, undefined>;

      beforeEach(async () => {
        subscription = await spawn(subscribe(subject));

        subject.update(() => 'bar');
        subject.update(() => 'baz');
        subject.update(() => 'quox');
      });

      it('iterates over emitted states', async () => {
        await expect(spawn(subscription.next())).resolves.toEqual({ done: false, value: 'bar' });
        await expect(spawn(subscription.next())).resolves.toEqual({ done: false, value: 'baz' });
        await expect(spawn(subscription.next())).resolves.toEqual({ done: false, value: 'quox' });
      });
    });

    describe('subscribe - unique state publish', () => {
      let result: string[];
      let subscription: ChainableSubscription<string, undefined>;

      beforeEach(async () => {
        result = [];

        subscription = await spawn(subscribe(subject));
        spawn(subscription.forEach(function*(state) { 
          result.push(state); 
        }));

        // foo is the initial value
        // should not appear as element 1 in the result
        subject.update(() => 'foo');
        subject.update(() => 'bar');
        subject.update(() => 'bar');
        subject.update(() => 'baz');
        subject.update(() => 'baz');
        // back to foo, should exist in the result
        subject.update(() => 'foo');
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
