import { describe, it } from 'mocha';
import expect from 'expect';
import { dom } from './helpers';
import { bigtestGlobals } from '@bigtest/globals';

import { createInteractor, Matcher } from '../src/index';

const Link = createInteractor<HTMLLinkElement>('link')
  .selector('a')
  .filters({
    title: (element) => element.title,
  })

function shouted(value: string): Matcher<string> {
  return {
    bigtestMatcher: true,
    match(actual: string): boolean {
      return actual === value.toUpperCase();
    },
    format(): string {
      return `uppercase ${JSON.stringify(value.toUpperCase())}`;
    },
  }
}

describe('@bigtest/interactor', () => {
  describe('matchers', () => {
    it('can use matcher on locator when locating element', async () => {
      dom(`
        <p><a href="/foobar">FOO</a></p>
        <p><a href="/foobar">BAR</a></p>
      `);

      await expect(Link(shouted('Foo')).exists()).resolves.toBeUndefined();
      await expect(Link(shouted('Quox')).exists()).rejects.toHaveProperty('message', [
        'did not find link uppercase "QUOX", did you mean one of:', '',
        '┃ link    ┃',
        '┣━━━━━━━━━┫',
        '┃ ⨯ "FOO" ┃',
        '┃ ⨯ "BAR" ┃',
      ].join('\n'));
    });

    it('can use matcher on filter when locating element', async () => {
      dom(`
        <p><a href="/foobar" title="FOO">Foo Bar</a></p>
        <p><a href="/foobar" title="BAR">Quox</a></p>
      `);

      await expect(Link('Foo Bar', { title: shouted('foo') }).exists()).resolves.toBeUndefined();
      await expect(Link('Foo Bar', { title: shouted('bar') }).exists()).rejects.toHaveProperty('message', [
        'did not find link "Foo Bar" with title uppercase "BAR", did you mean one of:', '',
        '┃ link        ┃ title: uppercase "BAR" ┃',
        '┣━━━━━━━━━━━━━╋━━━━━━━━━━━━━━━━━━━━━━━━┫',
        '┃ ✓ "Foo Bar" ┃ ⨯ "FOO"                ┃',
        '┃ ⨯ "Quox"    ┃ ✓ "BAR"                ┃',
      ].join('\n'));
    });

    it('can use matcher on filter when matching element', async () => {
      dom(`
        <p><a href="/foobar" title="FOO">Foo Bar</a></p>
        <p><a href="/foobar" title="BAR">Quox</a></p>
      `);

      await expect(Link('Foo Bar').has({ title: shouted('foo') })).resolves.toBeUndefined();
      await expect(Link('Foo Bar').has({ title: shouted('bar') })).rejects.toHaveProperty('message', [
        'link "Foo Bar" does not match filters:', '',
        '┃ title: uppercase "BAR" ┃',
        '┣━━━━━━━━━━━━━━━━━━━━━━━━┫',
        '┃ ⨯ "FOO"                ┃',
      ].join('\n'));
    });
  });
});
