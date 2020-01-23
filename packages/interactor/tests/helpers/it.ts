import { when } from '~/when';
import { Test } from 'mocha';

const it = (title: string, fn: () => Promise<any>) => window.it(title, () => when(async () => await fn()));

it.only = (title: string, fn: () => Promise<any>) =>
  window.it.only(title, () => when(async () => await fn()));
it.skip = window.it.skip;
it.retries = window.it.retries;

export { it };
