// import { describe, it } from 'mocha';
// import * as expect from 'expect';
// import { Atom } from '../src/atom';
// // import { spawn, when } from './helpers';
// // import { Subscription, subscribe, ChainableSubscription } from '@effection/subscription';
// // import { TestResult, ResultStatus } from '@bigtest/suite';
// import { Slice } from '../src/sliceable';

// type Data = { data: string };

// describe('@bigtest/atom Slice', () => {
//   describe('Slice', () => {
//     let atom: Atom<Data>;
//     let slice: Slice<string>;

//     beforeEach(() => {
//       atom = new Atom({ data: 'foo' });
//       slice = atom.slice()('data');
//     });

//     describe('.get()', () => {
//       it('gets the current state', () => {
//         expect(slice.get()).toEqual('foo');
//       });
//     });

//     describe('.update()', () => {
//       beforeEach(() => {
//         slice.update(previous => {
//           console.log(previous);
//           expect(previous).toEqual('foo');
//           return 'bar';
//         });
//       });

//       it('updates the current state', () => {
//         expect(slice.get()).toEqual('bar');
//       });

//       it.skip('updates the atom state', () => {
//         expect(atom.get()).toEqual({ data: 'bar' });
//       });
//     });

//   //   describe('.once()', () => {
//   //     let result: Promise<string | undefined>;

//   //     describe('when initial state matches', () => {
//   //       beforeEach(async () => {
//   //         result = spawn(slice.once((state) => state === 'foo'));

//   //         slice.update(() => 'bar');
//   //       });

//   //       it('gets the first state that passes the given predicate', async () => {
//   //         expect(await result).toEqual('foo');
//   //         expect(slice.get()).toEqual('bar');
//   //       });
//   //     });

//   //     describe('when initial state does not match', () => {
//   //       beforeEach(async () => {
//   //         result = spawn(slice.once((state) => state === 'baz'));

//   //         slice.update(() => 'bar');
//   //         slice.update(() => 'baz');
//   //         slice.update(() => 'quox');
//   //       });

//   //       it('gets the first state that passes the given predicate', async () => {
//   //         expect(await result).toEqual('baz');
//   //         expect(slice.get()).toEqual('quox');
//   //       });
//   //     });
//   //   });

//     // describe('.slice()', () => {
//     //   let atom: Atom<{ outer: Data }>;
//     //   let slice1: Slice<Data>;
//     //   let slice2: Slice<Data>;

//     //   beforeEach(() => {
//     //     atom = new Atom<{ outer: Data }>({ outer: { data: "baz" } });
//     //     slice1 = atom.slice()('outer');
//     //     let slice2 = slice1.slice('data');
//     //   });

//     //   it('further slices the slice', async () => {
//     //     expect(slice2.get()).toEqual('baz');
//     //   });

//     //   describe('updating the returned slice', () => {
//     //     beforeEach(() => {
//     //       slice2.set('blah');
//     //     });

//     //     it('updates the current state', () => {
//     //       expect(slice2.get()).toEqual('blah');
//     //     });

//     //     it('updates the parent slice state', () => {
//     //       expect(slice1.get()).toEqual({ data: 'blah' });
//     //     });

//     //     it('updates the atom state', () => {
//     //       expect(atom.get()).toEqual({ outer: { data: 'blah' } });
//     //     });
//     //   });
//     // });

//   //   type TestRunAgentState = {
//   //     status: ResultStatus;
//   //     agent: {
//   //       agentId: string;
//   //     };
//   //     result: TestResult;
//   //   }

//   //   type TestRunState = {
//   //     testRunId: string;
//   //     status: ResultStatus;
//   //     agents: Record<string, TestRunAgentState>;
//   //   }

//   //   type AtomState = {
//   //     testRuns: Record<string, TestRunState>;
//   //   }
    

//   //   describe('deep slices', () => {
//   //     let subject: AtomState = {
//   //       testRuns: {}
//   //     };
    
//   //     let atom: Atom<AtomState>;
//   //     let slice: Slice<TestRunState, AtomState>;

//   //     beforeEach(() => {
//   //       atom = new Atom(subject);
//   //       slice = atom.slice()('testRuns', 'testRunId');

//   //       slice.set({ 
//   //         testRunId: 'test-run-1',
//   //         status: 'pending',
//   //         agents: {
//   //           "agent-1": {
//   //             status: 'pending',
//   //             agent: { agentId: 'agent-1' },
//   //             result: {
//   //               description: 'some test',
//   //               status: 'pending',
//   //               steps: [
//   //                 { description: 'step one', status: 'pending' },
//   //                 { description: 'step two', status: 'running' }
//   //               ],
//   //               assertions: [
//   //                 { description: 'assertion one', status: 'pending' },
//   //                 { description: 'assertion two', status: 'pending' }
//   //               ],
//   //               children: [
//   //                 {
//   //                   description: 'another test',
//   //                   status: 'pending',
//   //                   steps: [
//   //                     { description: 'a child step', status: 'pending' }
//   //                   ],
//   //                   assertions: [
//   //                     { description: 'a child assertion', status: 'pending' }
//   //                   ],
//   //                   children: []
//   //                 }
//   //               ]
//   //             }
//   //           }
//   //         }
//   //       })
//   //     });
    
//   //     it('should resolve deeply nested properties with slice call at each step', () => {
//   //       expect(slice.slice('agents').slice('agent-1').slice('result').slice('steps').slice(0).slice('status').get()).toBe('pending');
//   //     });

//   //     it('should resolve deeply nested properties with path syntax', () => {
//   //       expect(slice.slice('agents', 'agent-1', 'result', 'steps', 1, 'status').get()).toBe('running');
//   //     });


//   //     describe('removal', () => {
//   //       it('should remove a a record', () => {
//   //         let agent = slice.slice('agents', 'agent-1');

//   //         // precondition
//   //         expect(slice.slice('agents', 'agent-1').get().agent).toBeTruthy();
          
//   //         agent.remove();

//   //         expect(slice.slice('agents', 'agent-1').get()).toBeUndefined();
//   //       })
//   //     });
//   //   });

//   //   describe('subscribe', () => {
//   //     let subscription: Subscription<string, void>;

//   //     beforeEach(async () => {
//   //       subscription = await spawn(subscribe(slice));

//   //       slice.update(() => 'bar');
//   //       slice.update(() => 'baz');
//   //       slice.update(() => 'quox');
//   //     });

//   //     it('iterates over emitted states', async () => {
//   //       await expect(spawn(subscription.next())).resolves.toEqual({ done: false, value: 'bar' });
//   //       await expect(spawn(subscription.next())).resolves.toEqual({ done: false, value: 'baz' });
//   //       await expect(spawn(subscription.next())).resolves.toEqual({ done: false, value: 'quox' });
//   //     });
//   //   });

//   //   describe('subscribe - unique state publish', () => {
//   //     let result: string[];
//   //     let subscription: ChainableSubscription<string, void>;

//   //     beforeEach(async () => {
//   //       result = [];

//   //       subscription = await spawn(subscribe(slice));
//   //       spawn(subscription.forEach(function*(state) { 
//   //         result.push(state); 
//   //       }));

//   //       // foo is the initial value
//   //       // should not appear as element 1 in the result
//   //       slice.update(() => 'foo');
//   //       slice.update(() => 'bar');
//   //       slice.update(() => 'bar');
//   //       slice.update(() => 'baz');
//   //       slice.update(() => 'baz');
//   //       // back to foo, should exist in the result
//   //       slice.update(() => 'foo');
//   //     });

//   //     it('should only publish unique state changes', async () => {
//   //       await when(() => {
//   //         expect(result).toHaveLength(3);
//   //         expect(result).toEqual(['bar', 'baz', 'foo']);
//   //       });
//   //     });
//   //   });
//   });
// });