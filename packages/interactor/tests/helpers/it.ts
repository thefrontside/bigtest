import { when } from '~/when';
import { Test } from 'mocha';

const it = (title: string, fn: () => Promise<Chai.Assertion>) => window.it(title, () => when(fn));

it.only = (title: string, fn: () => Promise<Chai.Assertion>) => window.it.only(title, () => when(fn));
it.skip = window.it.skip;
it.retries = window.it.retries;

export { it };
