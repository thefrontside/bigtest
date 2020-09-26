import { describe, it } from 'mocha';
import * as expect from 'expect';
import { Atom } from '../src/atom';
import { spawn, when } from './helpers';
import { Slice } from '../src/slice';
import { Subscription, subscribe, ChainableSubscription } from '@effection/subscription';

type Data = { data: string };

describe('@bigtest/atom Slice', () => {
  describe('Slice', () => {
    let atom: Atom<Data>;
    let slice: Slice<string, Data>;

    beforeEach(() => {
      atom = new Atom({ data: 'foo' });
      slice = atom.slice('data');
    });

    describe('.get()', () => {
      it('gets the current state', () => {
        expect(slice.get()).toEqual('foo');
      });
    });

    describe('.update()', () => {
      beforeEach(() => {
        slice.update(previous => {
          expect(previous).toEqual('foo');
          return 'bar';
        });
      });

      it('updates the current state', () => {
        expect(slice.get()).toEqual('bar');
      });

      it('updates the atom state', () => {
        expect(atom.get()).toEqual({ data: 'bar' });
      });
    });

    describe('.once()', () => {
      let result: Promise<string | undefined>;

      describe('when initial state matches', () => {
        beforeEach(async () => {
          result = spawn(slice.once((state) => state === 'foo'));

          slice.update(() => 'bar');
        });

        it('gets the first state that passes the given predicate', async () => {
          expect(await result).toEqual('foo');
          expect(slice.get()).toEqual('bar');
        });
      });

      describe('when initial state does not match', () => {
        beforeEach(async () => {
          result = spawn(slice.once((state) => state === 'baz'));

          slice.update(() => 'bar');
          slice.update(() => 'baz');
          slice.update(() => 'quox');
        });

        it('gets the first state that passes the given predicate', async () => {
          expect(await result).toEqual('baz');
          expect(slice.get()).toEqual('quox');
        });
      });
    });

    describe('.slice()', () => {
      let atom: Atom<{ outer: Data }>;
      let slice1: Slice<Data, { outer: Data }>;
      let slice2: Slice<string, { outer: Data }>;

      beforeEach(() => {
        atom = new Atom<{ outer: Data }>({ outer: { data: "baz" } });
        slice1 = atom.slice('outer');
        slice2 = slice1.slice('data');
      });

      it('further slices the slice', async () => {
        expect(slice2.get()).toEqual('baz');
      });

      describe('updating the returned slice', () => {
        beforeEach(() => {
          slice2.set('blah');
        });

        it('updates the current state', () => {
          expect(slice2.get()).toEqual('blah');
        });

        it('updates the parent slice state', () => {
          expect(slice1.get()).toEqual({ data: 'blah' });
        });

        it('updates the atom state', () => {
          expect(atom.get()).toEqual({ outer: { data: 'blah' } });
        });
      });
    });

    describe('subscribe', () => {
      let subscription: Subscription<string, undefined>;

      beforeEach(async () => {
        subscription = await spawn(subscribe(slice));

        slice.update(() => 'bar');
        slice.update(() => 'baz');
        slice.update(() => 'quox');
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

        subscription = await spawn(subscribe(slice));
        spawn(subscription.forEach(function*(state) { 
          result.push(state); 
        }));

        // foo is the initial value
        // should not appear as element 1 in the result
        slice.update(() => 'foo');
        slice.update(() => 'bar');
        slice.update(() => 'bar');
        slice.update(() => 'baz');
        slice.update(() => 'baz');
        // back to foo, should exist in the result
        slice.update(() => 'foo');
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
