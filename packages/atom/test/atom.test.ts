import { describe, it } from 'mocha';
import * as expect from 'expect';
import { Atom } from '../src/atom';
import { subscribe, Subscription } from '@effection/subscription';
import { spawn } from './helpers';
// import { Subscription, subscribe, ChainableSubscription } from '@effection/subscription';

type TestRunAgentState = {
  status: "pending" | "running" | "finished" | "errored";
  platform?: {
    type: string;
    vendor: string;
  };
};

export type TestRunState = {
  status: "on" | "off";
  agents: Record<string, TestRunAgentState>;
};

const state: TestRunState = {
  status: "on",
  agents: {
    "agent-1": {
      status: "pending",
      platform: {
        type: "desktop",
        vendor: "Apple"
      }
    },
    "agent-2": {
      status: "running",
      platform: {
        type: "desktop",
        vendor: "Microsoft"
      }
    }
  }
};

describe('@bigtest/atom', () => {
  describe('Atom', () => {
    let subject: Atom<TestRunState>;

    describe('Atom with none', () => {
      beforeEach(() => {
        subject = new Atom();
      })
  
      describe('.get()', () => {
        it('gets the current state', () => {
          expect(subject.get()).toBeUndefined();
        });
      });
    });

    describe('Atom with some', () => {
      beforeEach(() => {
        subject = new Atom(state);
      });

      describe('.get()', () => {
        it('gets the current state', () => {
          expect(subject.get()).toEqual(state);
        });
      });
    });

    describe('.slice()', () => {
      let subject: Atom<TestRunState>;

      beforeEach(() => {
        subject = new Atom(state);
      });

      it('returns one level deep', () => {
        let result = subject.slice()('agents');

        expect(result.get()).toEqual(state.agents);
      });

      it('returns a slice of the Atom with the given path', async () => {
        let result = subject.slice()('agents', "agent-2", "status");

        expect(result.get()).toEqual("running");
      });

      it('set', () => {
        let result = subject.slice()('agents', "agent-2", "status");

        result.set('errored');

        expect(result.get()).toBe('errored');
      })
    });

    describe('.update()', () => {
      beforeEach(() => {
        subject.update(previous => {
          expect(previous).toEqual(state);
          return {...state, status: "off"}
        });
      });

      it('updates the current state', () => {
        expect(subject.get()?.status).toEqual("off");
      });
    });

    type State = { foo: string};
    describe('subscribe', () => {
      let subject: Atom<State>;
      let subscription: Subscription<State, undefined>;

      beforeEach(async () => {
        subject = new Atom({foo: 'bar'});
        subscription = await spawn(subscribe(subject));

        subject.update(() => ({ foo: 'bar' }));
        subject.update(() => ({ foo: 'baz' }));
        subject.update(() => ({ foo: 'quox' }));
      });

      it('iterates over emitted states', async () => {
        await expect(spawn(subscription.next())).resolves.toEqual({ done: false, value: { foo: 'bar' } });
        await expect(spawn(subscription.next())).resolves.toEqual({ done: false, value: { foo: 'baz' } });
        await expect(spawn(subscription.next())).resolves.toEqual({ done: false, value: { foo: 'quox' } });
      });
    });

    describe('.once()', () => {
      let result: Promise<State>;
      let subject: Atom<State>;

      describe('when initial state matches', () => {
        beforeEach(async () => {
          subject = new Atom({foo: 'bar'});
          result = spawn(subject.once((state) => state.foo === 'bar'));

          subject.update(() => ({ foo: 'baz' }));
        });

        it('gets the first state that passes the given predicate', async () => {
          expect(await result).toEqual({ foo: 'bar' });
          expect(subject.get()).toEqual({ foo: 'baz' });
        });
      });

      // describe('when initial state does not match', () => {
      //   beforeEach(async () => {
      //     result = spawn(subject.once((state) => state.foo === 'baz'));

      //     subject.update(() => ({ foo: 'bar' }));
      //     subject.update(() => ({ foo: 'baz' }));
      //     subject.update(() => ({ foo: 'quox' }));
      //   });

      //   it('gets the first state that passes the given predicate', async () => {
      //     expect(await result).toEqual({ foo: 'baz' });
      //     expect(subject.get()).toEqual({ foo: 'quox' });
      //   });
      // });
    });

    // describe('.reset()', () => {
    //   describe.skip('without an initializer', () => {
    //     beforeEach(async () => {
    //       subject.update(() => ({ foo: 'baz'}));

    //       subject.reset();
    //     });

    //     it('resets to the initial value', async () => {
    //       expect(subject.get()).toEqual({ foo: 'bar' });
    //     });
    //   });

    //   describe('with an initializer', () => {
    //     let initializerArgs: Subject[];

    //     beforeEach(async () => {
    //       subject.update(() => ({ foo: 'bar' }));

    //       subject.reset((initial, current) => {
    //         initializerArgs = [initial, current];
    //         return { foo: 'baz'};
    //       });
    //     });

    //     it('resets to the value returned from the given function', async () => {
    //       expect(subject.get()).toEqual({ foo: 'baz' });
    //     });

    //     it('provides the initial and current values as arguments to the given function', async () => {
    //       expect(initializerArgs).toEqual([{ foo: 'bar' }, { foo: 'bar' }]);
    //     });
    //   });

    //   describe('removing listeners', () => {
    //     let result: Subject[];

    //     beforeEach(async () => {
    //       result = [];

    //       let subscription = await spawn(subscribe(subject));
    //       spawn(subscription.forEach(function*(state) { result.push(state); }));

    //       subject.update(() => ({ foo: 'state before reset' }));
    //       subject.reset(() => ({ foo: 'reset state' }));
    //       subject.update(() => ({ foo: 'state after reset' }));
    //     });

    //     it('emits state changes to listeners before reset', async () => {
    //       await when(() => {
    //         expect(result).toEqual([{ foo: 'state before reset' }]);
    //       });
    //     });

    //     it('stops emitting changes to listeners set before reset', async () => {
    //       await never(() => {
    //         expect(result).toEqual([{ foo: 'state before reset' }, { foo: 'state after reset' }]);
    //       });
    //     });
    //   });
    // });


    // describe.only('subscribe - unique state publish', () => {
    //   let result: Subject[];
    //   let subscription: ChainableSubscription<Subject, undefined>;

    //   beforeEach(async () => {
    //     result = [];

    //     subscription = await spawn(subscribe(subject));
    //     spawn(subscription.forEach(function*(state) { 
    //       result.push(state); 
    //     }));

    //     // foo is the initial value
    //     // should not appear as element 1 in the result
    //     subject.update(() => ({ foo: 'bar' }));
    //     subject.update(() => ({ foo: 'bar' }));
    //     subject.update(() => ({ foo: 'baz' }));
    //     subject.update(() => ({ foo: 'baz' }));
    //     subject.update(() => ({ foo: 'qux' }));
    //     // back to foo, should exist in the result
    //     subject.update(() => ({ foo: 'qux' }));
    //   });

    //   it('should only publish unique state changes', async () => {
    //     await when(() => {
    //       expect(result).toHaveLength(3);
    //       expect(result).toEqual([{ foo: 'bar' }, { foo: 'baz'}, { foo: 'qux'}]);
    //     });
    //   });
    // });
  });
});
