import { main, Operation, Context } from 'effection';
import { describe, it } from 'mocha';
import * as expect from 'expect'
import fetch from 'node-fetch';

import { firefox, BrowserType, Browser, Page } from 'playwright';

import { AgentConnectionServer, AgentServer } from '../src/index';

import { Mailbox } from '@bigtest/effection';
import { AgentConnection } from 'src/client';

describe("@bigtest/agent", () => {
  let World: Context;
  async function spawn<T>(operation: Operation): Promise<T> {
    return World["spawn"](operation);
  }

  function launch(browserType: BrowserType, options = {}): Promise<Browser> {
    return spawn(({ resume, fail, context: { parent } }) => {
      browserType.launch(options)
        .then(browser => {
          parent['ensure'](() => browser.close());
          resume(browser);
        })
        .catch(error => fail(error));
    });
  }

  beforeEach(() => {
    World = main(undefined);
  });

  afterEach(() => {
    World.halt();
  });

  describe('starting a new server', () => {
    let server: AgentServer;
    let client: AgentConnectionServer;
    let delegate: Mailbox;
    let connection: AgentConnection;

    beforeEach(async () => {
      server = AgentServer.create({port: 8000}, 'dist/app');
      client = new AgentConnectionServer({
        port: 8001,
        inbox: new Mailbox(),
        delegate: delegate = new Mailbox()
      });

      await spawn(server.listen());

      await spawn(client.listen(function*(conn: AgentConnection) {
        connection = conn;
        try {
          yield
        } finally {
          connection = undefined;
        }
      }));
    });

    it('has an agent url where it will server the agent application', () => {
      expect(server.harnessScriptURL).toBeDefined();
    });

    it('can genenrate the full connect URL', () => {
      expect(server.connectURL('ws://websocket-server.com')).toContain('websocket-server');
    });

    describe('fetching the harness', () => {

      let harnessBytes: string;
      beforeEach(async () => {
        let response = await fetch(server.harnessScriptURL);
        harnessBytes = await response.text();
      });

      it('has the javascripts', () => {
        expect(harnessBytes).toContain('harness');
      });
    });


    describe('connecting a browser to the agent URL', () => {
      let browser: Browser;
      let page: Page;

      beforeEach(async function() {
        this.timeout(10000);
        browser = await launch(firefox, { headless: false });
        page = await browser.newPage();
        await page.goto(server.connectURL(`ws://localhost:8001`));
        await spawn(delegate.receive({ connected: true }));
      });

      afterEach(async () => {
        if (page) {
          await page.close();
        }
      })
      it('connects back to the agent connection server ', () => {
        expect(browser).toBeDefined();
        expect(connection).toBeDefined();
        expect(typeof connection.id).toEqual('string');
      });

      describe('closing browser connection', () => {
        beforeEach(async () => {
          await page.close();
          await spawn(delegate.receive({ connected: false }))
        });

        it('closes the connection scope', () => {
          expect(connection).toBeUndefined();
        });
      });

    });
  });

  describe('a proxy development server', () => {
    let server: AgentServer;
    beforeEach(async () => {
      server = AgentServer.create({ port: 8000, externalURL: 'http://host.com' });
    });

    it('appends the pre-configured connect back url', () => {
      expect(server.connectURL('ws://localhost:5000')).toEqual(`http://host.com/?connectTo=${encodeURIComponent('ws://localhost:5000')}`);
    });
  });
});
