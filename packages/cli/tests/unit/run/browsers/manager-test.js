import { describe, it } from 'mocha';
import { expect, fake } from '@tests/helpers';

import BrowserManager from '@run/browsers';
import BaseBrowser from '@run/browsers/base';
import ChromeBrowser from '@run/browsers/chrome';
import FireFoxBrowser from '@run/browsers/firefox';
import SafariBrowser from '@run/browsers/safari';

class TestBrowser extends BaseBrowser {
  static options = 'test';
  launch = fake();
  kill = fake();
}

describe('Unit: Browser - Manager', () => {
  it('automatically includes local browsers', () => {
    let test = new BrowserManager(['chrome', 'firefox', 'safari']);
    expect(test.browsers).to.have.a.lengthOf(3);
    expect(test.browsers[0]).to.be.an.instanceof(ChromeBrowser);
    expect(test.browsers[1]).to.be.an.instanceof(FireFoxBrowser);
    expect(test.browsers[2]).to.be.an.instanceof(SafariBrowser);
  });

  it('allows custom browsers to be provided', () => {
    let test = new BrowserManager([TestBrowser]);
    expect(test.browsers).to.have.a.lengthOf(1);
    expect(test.browsers[0]).to.be.an.instanceof(TestBrowser);
  });

  it('passes nested options defined by a static options property', () => {
    let test = new BrowserManager([TestBrowser], { test: { foo: 'bar' } });
    expect(test.browsers[0].options).to.deep.equal({ foo: 'bar' });
  });

  it('throws an error when the browser cannot be found', () => {
    expect(() => new BrowserManager(['test']))
      .to.throw('Cannot find browser "test"');
  });

  it('throws an error when a valid browser is not provided', () => {
    expect(() => new BrowserManager([class Test {}]))
      .to.throw('Invalid browser "Test"');
  });

  it('invokes launch for all browsers and resolves when done', async () => {
    let test = new BrowserManager([TestBrowser, TestBrowser]);
    let id = i => test.browsers[i].id;

    let launching = [];
    let hook = browser => launching.push(browser);

    await expect(test.launch('test', hook)).to.be.fulfilled;

    expect(test.browsers[0].launch).to.have.been.calledWith(`test?l=${id(0)}`);
    expect(test.browsers[1].launch).to.have.been.calledWith(`test?l=${id(1)}`);
    expect(launching).to.deep.equal(test.browsers);
  });

  it('invokes launch for all browsers and rejects when one does', async () => {
    let test = new BrowserManager([TestBrowser, TestBrowser, TestBrowser]);

    test.browsers[1].launch = fake.throws('fail');
    await expect(test.launch()).to.be.rejectedWith('fail');

    expect(test.browsers[0].launch).to.have.been.calledOnce;
    expect(test.browsers[1].launch).to.have.been.calledOnce;
    expect(test.browsers[2].launch).to.have.not.been.called;
  });

  it('invokes kill for all browsers and resolves when done', async () => {
    let test = new BrowserManager([TestBrowser, TestBrowser]);
    await expect(test.kill()).to.be.fulfilled;

    expect(test.browsers[0].kill).to.have.been.calledOnce;
    expect(test.browsers[1].kill).to.have.been.calledOnce;
  });

  it('invokes kill for all browsers and rejects when one does', async () => {
    let test = new BrowserManager([TestBrowser, TestBrowser, TestBrowser]);

    test.browsers[1].kill = fake.throws('fail');
    await expect(test.kill()).to.be.rejectedWith('fail');

    expect(test.browsers[0].kill).to.have.been.calledOnce;
    expect(test.browsers[1].kill).to.have.been.calledOnce;
    expect(test.browsers[2].kill).to.have.not.been.called;
  });
});
