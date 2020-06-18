import { describe, it } from 'mocha';
import * as expect from 'expect';
import { Atom } from '../src/atom';
import { spawn, converge, never } from './helpers';
import { Slice } from '../src/slice';

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

    describe('.each()', () => {
      let result: string[] = [];

      beforeEach(() => {
        spawn(subject.each(function*(state) {
          result.push(state);
        }));

        subject.update(() => 'bar');
        subject.update(() => 'baz');
      });

      it('performs given operation for each state change', async () => {
        await converge(50, () => {
          expect(result).toEqual(['bar', 'baz']);
        });
      });
    });

    describe('.once()', () => {
      let result: Promise<string | undefined>;

      beforeEach(async () => {
        result = spawn(subject.once(() => true));

        subject.update(() => 'bar');
        subject.update(() => 'baz');
      });

      it('gets the first state that passes the given predicate', async () => {
        expect(await result).toEqual('bar');
        expect(subject.get()).toEqual('baz');
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

        it('removes listeners', () => {
          expect(subject['subscriptions'].listenerCount('state')).toEqual(0);
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

          spawn(subject.each(function*(state) {
            result.push(state);
          }));

          subject.update(() => 'state before reset');
          subject.reset(() => 'reset state');
          subject.update(() => 'state after reset');
        });

        it('emits state changes to listeners before reset', async () => {
          await converge(50, () => {
            expect(result).toEqual(['state before reset']);
          });
        });

        it('stops emitting changes to listeners set before reset', async () => {
          await never(50, () => {
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
        result = subject.slice(['foo', 'bar']);
      });

      it('returns a slice of the Atom with the given path', async () => {
        expect(result.get()).toEqual('baz');
      });
    });
  });
});
