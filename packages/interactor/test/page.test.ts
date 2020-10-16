import { describe, it, beforeEach } from 'mocha';
import * as expect from 'expect';
import * as express from 'express';
import { Server } from 'http';

import { bigtestGlobals } from '@bigtest/globals';
import { JSDOM, ResourceLoader } from 'jsdom';

import { Page } from '../src/index';

describe('@bigtest/interactor', function() {
  describe('Page', () => {
    describe('visit', () => {
      let jsdom: JSDOM;
      let server: Server;

      beforeEach(async () => {
        bigtestGlobals.reset();

        let app = express();

        app.get('/', (req, res) => {
          setTimeout(function() {
            res.writeHead(200, {'Content-Type': 'text/html'});
            res.write('<!doctype html><html><h1>Homepage</h1></html>');
            res.end();
          }, 20);
        });

        app.get('/foobar', (req, res) => {
          res.writeHead(200, {'Content-Type': 'text/html'});
          res.write('<!doctype html><html><h1>On foobar!</h1></html>');
          res.end();
        });

        server = app.listen(27000);

        let resources = new ResourceLoader({ proxy: "http://localhost:27000" });
        jsdom = new JSDOM(`<!doctype html><html><body><iframe/></body></html>`, { resources });
        bigtestGlobals.testFrame = jsdom.window.document.querySelector('iframe') as HTMLIFrameElement;
        bigtestGlobals.appUrl = 'http://example.com';
      });

      afterEach(() => {
        server?.close();
        jsdom?.window?.close();
      });

      it('can load the app by visiting the root path', async () => {
        await Page.visit();
        await expect(bigtestGlobals.testFrame?.src).toEqual('http://example.com/');
      });

      it('can load the app by visiting the given path', async () => {
        await Page.visit('/foobar');
        await expect(bigtestGlobals.testFrame?.src).toEqual('http://example.com/foobar');
      });

      it('is an interaction which can describe itself', async () => {
        expect(Page.visit('/foobar').description).toEqual('visiting "/foobar"');
      });

      it('throws an error if app url is not defined', async () => {
        bigtestGlobals.appUrl = undefined;
        await expect(Page.visit('/foobar')).rejects.toThrow('no app url defined');
      });

      it('throws an error if test frame is not defined', async () => {
        bigtestGlobals.testFrame = undefined;
        await expect(Page.visit('/foobar')).rejects.toThrow('no test frame defined');
      });
    });
  });
});
