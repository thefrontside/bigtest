import { describe, it } from 'mocha';
import expect from 'expect';

import { timeout, contextOf, Context } from 'effection';

import { spawn } from './helpers';

import { readyResource } from '../src/ready-resource';

describe('readyResource', () => {
  let list: string[];
  let context: Context<void>;
  let someResource: { foo: string };

  beforeEach(async () => {
    list = [];

    function* makeSomeResource() {
      return yield readyResource({ foo: 'bar' }, function*(ready) {
        yield timeout(2);
        list.push('before-ready');
        yield timeout(2);
        ready();
        yield timeout(2);
        list.push('after-ready');
      });
    }

    context = spawn(function*() {
      someResource = yield makeSomeResource();
      list.push('in main');
      yield contextOf(someResource);
    });

    await context;
  });

  it('preserves resource shape', () => {
    expect(someResource.foo).toEqual('bar');
  });

  it('blocks until ready callback called', () => {
    expect(list).toEqual(['before-ready', 'in main', 'after-ready']);
  });
});
