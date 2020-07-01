import { describe, it } from 'mocha';
import * as expect from 'expect'

import { bigtestGlobals } from '@bigtest/globals';
import { JSDOM } from 'jsdom';

import { App } from '../src/index';

describe('@bigtest/interactor', () => {
  beforeEach(() => {
    bigtestGlobals.reset();
    let jsdom = new JSDOM(`<!doctype html><html><body><iframe/></body></html>`);
    bigtestGlobals.testFrame = jsdom.window.document.querySelector('iframe') as HTMLIFrameElement;
    bigtestGlobals.appUrl = 'http://example.com';
  });

  describe('App', () => {
    describe('load', () => {
      it('can load the app by visiting the root path', async () => {
        await App.load();
        await expect(bigtestGlobals.testFrame?.src).toEqual('http://example.com/');
      });

      it('is an interaction which can describe itself', async () => {
        expect(App.load().description).toEqual('loading the app');
      });

      it('throws an error if app url is not defined', async () => {
        bigtestGlobals.appUrl = undefined;
        await expect(App.load()).rejects.toThrow('no app url defined');
      });

      it('throws an error if test frame is not defined', async () => {
        bigtestGlobals.testFrame = undefined;
        await expect(App.load()).rejects.toThrow('no test frame defined');
      });
    });

    describe('visit', () => {
      it('can load the app by visiting the given path', async () => {
        await App.visit('/foobar');
        await expect(bigtestGlobals.testFrame?.src).toEqual('http://example.com/foobar');
      });

      it('is an interaction which can describe itself', async () => {
        expect(App.visit('/foobar').description).toEqual('visiting "/foobar"');
      });

      it('throws an error if app url is not defined', async () => {
        bigtestGlobals.appUrl = undefined;
        await expect(App.visit('/foobar')).rejects.toThrow('no app url defined');
      });

      it('throws an error if test frame is not defined', async () => {
        bigtestGlobals.testFrame = undefined;
        await expect(App.visit('/foobar')).rejects.toThrow('no test frame defined');
      });
    });
  });
});
