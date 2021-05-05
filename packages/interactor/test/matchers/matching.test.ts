import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from '../helpers';

import { HTML, matching } from '../../src/index';
import { Matcher } from '../../src/matcher';

function matchingWithDeprecatedFormat(regexp: RegExp): Matcher<string> {
  return {
    match(actual: string): boolean {
      return actual.match(regexp) != null;
    },
    format(): string {
      return `matching ${regexp}`;
    },
  }
}

describe('@bigtest/interactor', () => {
  beforeEach(() => {
    dom(`
      <div title="hello world"></div>
      <div title="what the heck"></div>
    `);
  });
  
  describe('matching', () => {
    it('can check whether the given string matching', async () => {
      await HTML({ title: matching(/he(llo|ck)/) }).exists();
      await expect(HTML({ title: matching(/blah/) }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
    });
  });

  describe('matching with deprecated format() API', () => {
    it('can check whether the given string matching', async () => {
      await HTML({ title: matchingWithDeprecatedFormat(/he(llo|ck)/) }).exists();
      await expect(HTML({ title: matchingWithDeprecatedFormat(/blah/) }).exists()).rejects.toHaveProperty('name', 'NoSuchElementError')
    });
  })
});
