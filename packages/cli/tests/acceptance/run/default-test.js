import { describe, it } from 'mocha';
import { expect, dedent } from '@tests/helpers';
import bigtest from '@tests/acceptance/command';

describe('Acceptance: `bigtest run`', () => {
  it('has help output', async () => {
    let { stdout } = await bigtest('run --help');

    expect(stdout.toString()).to.equal(dedent`
      Usage: bigtest run [options]

      Options:
        -b, --browser, --browsers    One or more browsers to launch  [default: "System Default"]
        -r, --reporter, --reporters  One or more reporters to use  [default: "dot"]
        -v, --verbose                Show debug logs  [boolean]
        --plugins                    One or more plugins to use
        --once                       Run once and exit  [boolean]
        --opts                       Path to options file  [default: "bigtest/bigtest.opts"]
        --version                    Show version number  [boolean]
        --help                       Show help  [boolean]

      Client Options:
        --client-hostname  Client server host name  [string] [default: "localhost"]
        --client-port      Client server port number  [number] [default: 4567]

      Proxy Options:
        --proxy-hostname  Proxy server host name  [string] [default: "localhost"]
        --proxy-port      Proxy server port number  [number] [default: 5678]

      Serve Options:
        -s, --serve     App server command  [string]
        --serve-url     App server URL  [string] [default: "http://localhost:3000"]
        --serve-silent  Surpress app server output  [boolean] [default: false]

      Adapter Options:
        -a, --adapter   Adapter name  [string]
        --adapter-path  Adapter path to serve  [string]

    `);
  });
});
