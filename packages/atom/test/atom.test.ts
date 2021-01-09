import { describe, it } from 'mocha';
import expect from 'expect';
import { createAtom, DefaultChannelMaxListeners, resetAtom } from '../src/atom';
import { spawn, when, never } from './helpers';
import { ChainableSubscription, subscribe, Subscription } from '@effection/subscription';
import { Slice } from '../src/types';

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

describe('@bigtest/atom createAtom', () => {
  describe('Atom with none', () => {
    let subject: Slice<undefined>;
    beforeEach(() => {
      subject = createAtom(undefined);
    });
    
    describe('.get()', () => {
      it('gets the current state', () => {
        expect(subject.get()).toBeUndefined();
      });
    });
  });

  let subject: Slice<TestRunState>;

  describe('Atom with some', () => {
    beforeEach(() => {
      subject = createAtom(state);
    });

    describe('.get()', () => {
      it('gets the current state', () => {
        expect(subject.get()).toEqual(state);
      });
    });
  });

  describe('.set()', () => {
    beforeEach(() => {
      subject = createAtom(state);
    });

    beforeEach(() => {
      subject.set({...state, status: "off"});
    });

    it('updates the current state', () => {
      expect(subject.get()?.status).toEqual("off");
    });
  });

  describe('.update()', () => {
    beforeEach(() => {
      subject = createAtom(state);
    });

    beforeEach(() => {
      subject.update(previous => {
        expect(previous).toEqual(state);
        return {...previous, status: "off"}
      });
    });

    it('updates the current state', () => {
      expect(subject.get()?.status).toEqual("off");
    });
  });

  describe('.slice()', () => {
    let subject: Slice<TestRunState>;

    beforeEach(() => {
      subject = createAtom(state);
    });

    it('returns one level deep', () => {
      let result = subject.slice('agents');

      expect(result.get()).toEqual(state.agents);
    });

    it('returns a slice of the Atom with the given path', async () => {
      let result = subject.slice('agents', "agent-2", 'status');

      expect(result.get()).toEqual("running");
    });

    it('set', () => {
      let result = subject.slice('agents', "agent-2", "status");

      result.set('errored');

      expect(result.get()).toBe('errored');
    })
  });


  type State = { foo: string};
  describe('subscribe', () => {
    let subject: Slice<State>;
    let subscription: Subscription<State, undefined>;

    beforeEach(async () => {
      subject = createAtom({foo: 'bar'});
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
    let subject: Slice<State>;

    describe('when initial state matches', () => {
      beforeEach(async () => {
        subject = createAtom({foo: 'bar'});
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

  type Subject = {
    foo: string;
  }

  describe('.reset()', () => {
    let subject: Slice<State>;
    beforeEach(() => {
      subject = createAtom({foo: 'bar'});
    });
    
    describe('without an initializer', () => { 
      beforeEach(async () => {
        subject.update(() => ({ foo: 'baz'}));

        resetAtom(subject);
      });

      it('resets to the initial value', async () => {
        expect(subject.get()).toEqual({ foo: 'bar' });
      });
    });

    describe('with an initializer', () => {
      let initializerArgs: Subject[];

      beforeEach(async () => {
        subject.update(() => ({ foo: 'bar' }));

        resetAtom(subject, (initial: State, current: State) => {
          initializerArgs = [initial, current];
          return { foo: 'baz'};
        });
      });

      it('resets to the value returned from the given function', async () => {
        expect(subject.get()).toEqual({ foo: 'baz' });
      });

      it('provides the initial and current values as arguments to the given function', async () => {
        expect(initializerArgs).toEqual([{ foo: 'bar' }, { foo: 'bar' }]);
      });
    });

    describe('removing listeners', () => {
      let result: Subject[];

      beforeEach(async () => {
        result = [];

        let subscription = await spawn(subscribe(subject));
        spawn(subscription.forEach(function*(state) { 
          result.push(state); 
        }));

        subject.update(() => ({ foo: 'state before reset' }));
        resetAtom(subject, () => ({ foo: 'reset state' }));
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

  describe('subscribe - unique state publish', () => {
    let result: Subject[];
    let subject: Slice<Subject>;
    let subscription: ChainableSubscription<Subject, undefined>;

    beforeEach(async () => {
      result = [];
      let bar = { foo: 'bar' };
      let baz = { foo: 'baz' };
      let qux = { foo: 'qux' };

      subject = createAtom(bar);

      subscription = await spawn(subscribe(subject));

      spawn(subscription.forEach(function*(state) { 
        result.push(state); 
      }));

      subject.update(() => bar);
      subject.update(() => bar);
      subject.update(() => baz);
      subject.update(() => baz);
      subject.update(() => qux);
      subject.update(() => bar);
    });

    it('should only publish unique state changes', async () => {
      await when(() => {
        expect(result).toHaveLength(3);
        expect(result).toEqual([{ foo: 'baz'}, { foo: 'qux'}, { foo: 'bar' }]);
      });
    });
  });

  describe('channel maxListeners', () => {
    it('should set a default value for the channel max listeners' , () => {
      let atom = createAtom(undefined);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((atom as any)._channelMaxListeners).toBe(DefaultChannelMaxListeners);
    });

    it('should be able to override channel max listeners' , () => {
      let atom = createAtom(undefined, { channelMaxListeners: 33 });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((atom as any)._channelMaxListeners).toBe(33);
    });
  })
});
