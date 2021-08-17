import { describe, it, beforeEach } from 'mocha';
import expect from 'expect';
import express from 'express';
import { Server } from 'http';

import { bigtestGlobals } from '@bigtest/globals';
import { JSDOM, ResourceLoader } from 'jsdom';

import { dom } from './helpers';

import { Page, read } from '../src/index';

describe('@interactors/html', function() {
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
        await expect(read(Page, 'url')).resolves.toEqual('http://example.com/');
      });

      it('can load the app by visiting the given path', async () => {
        await Page.visit('/foobar');
        await expect(read(Page, 'url')).resolves.toEqual('http://example.com/foobar');
      });

      it('can reload the app by visiting changed url hash', async () => {
        await Page.visit('/#/foo');
        await expect(read(Page, 'url')).resolves.toEqual('http://example.com/#/foo');
        await Page.visit('/#/bar');
        await expect(read(Page, 'url')).resolves.toEqual('http://example.com/#/bar');
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

    describe('filter `title`', () => {
      it('can check the page title', async() => {
        let window = dom('');
        window.document.title = 'Hello World';

        await expect(Page.has({ title: 'Hello World' })).resolves.toBeUndefined();
        await expect(Page.has({ title: 'Does Not Exist' })).rejects.toHaveProperty('message', [
          'page does not match filters:', '',
          '╒═ Filter:   title',
          '├─ Expected: "Does Not Exist"',
          '└─ Received: "Hello World"',
        ].join('\n'))
      });
    });

    describe('filter `url`', () => {
      it('can check the page url', async() => {
        dom('');

        await expect(Page.has({ url: 'about:blank' })).resolves.toBeUndefined();
        await expect(Page.has({ url: 'does-not-exist' })).rejects.toHaveProperty('message', [
          'page does not match filters:', '',
          '╒═ Filter:   url',
          '├─ Expected: "does-not-exist"',
          '└─ Received: "about:blank"',
        ].join('\n'))
      });
    });
  });
});
