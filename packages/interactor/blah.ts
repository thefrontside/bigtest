import { createInteractor } from './src/index';
import { bigtestGlobals } from '@bigtest/globals';

import { JSDOM } from 'jsdom';

let jsdom = new JSDOM(`
  <!doctype html><html><body>
    <a href="#" title="Bar">Some link</a>
    <a href="#" title="Foo">Other link with a really long text here, yes it is too long</a>
  </body></html>
`, { runScripts: "dangerously" });

bigtestGlobals.document = jsdom.window.document;

const Link = createInteractor<HTMLLinkElement>('link')
  .selector('a')
  .filters({
    href: (element) => element.href,
    title: (element) => element.title,
  })


async function run() {
  await Link('Some link', { title: "Foo" }).exists()
  // await Link('Some link').has({ title: "Foo" });
};

run().catch((error) => console.error(error));
