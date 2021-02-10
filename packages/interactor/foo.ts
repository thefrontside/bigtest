import { createInteractor } from './src/index';
import { bigtestGlobals } from '@bigtest/globals';

import { JSDOM } from 'jsdom';

let jsdom = new JSDOM(`
  <!doctype html><html><body>
    <a href="#" title="Click here to sign in" id="sign-in-link">Sign in</a>
    <a href="#" id="about-link">About</a>
  </body></html>
`, { runScripts: "dangerously" });

bigtestGlobals.document = jsdom.window.document;

const Link = createInteractor<HTMLLinkElement>('link')
  .selector('a')
  .filters({
    href: (element) => element.href,
    title: (element) => element.title,
    id: (element) => element.id,
  })


async function run() {
  await Link('Sign in', { id: 'does-not-exist' }).exists();
  // await Link('Sign in').has({ id: 'does-not-exist', title: 'Click here to sign in' });
};

run().catch((error) => console.error(error));
