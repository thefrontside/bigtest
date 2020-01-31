import { describe, beforeEach, it } from 'mocha';
import { expect } from '@tests/helpers';

import create from '@run/state/create';
import Test, {
  BrowserTest,
  RunningBrowserTest,
  PassingBrowserTest,
  SkippedBrowserTest,
  FailingBrowserTest,
  BrowserError
} from '@run/state/test';

describe('Unit: State - Test', () => {
  it('creates a test state instance', () => {
    expect(create(Test)).to.be.an.instanceof(Test)
      .and.deep.equal({ name: '', path: [], all: [] });
  });

  it('has a name, path, and array of browser tests', () => {
    expect(create(Test, { name: 'test', path: ['a', 'b'] }))
      .to.deep.equal({ name: 'test', path: ['a', 'b'], all: [] });
  });

  it('given a browser name adds to the list of browser tests', () => {
    expect(create(Test, { browser: 'chrome' }).all[0])
      .to.be.an.instanceof(BrowserTest)
      .and.deep.equal({ browser: 'chrome' });
  });

  it('updates the test immutably with an existing or new browser test', () => {
    let test1 = create(Test, { name: 'test', browser: 'chrome' });
    let test2 = test1.update({ browser: 'chrome', passing: true });

    expect(test2).to.not.equal(test1);
    expect(test2.name).to.equal('test');
    expect(test2.all).to.not.equal(test1.all);
    expect(test2.all[0]).to.not.equal(test1.all[0]);
    expect(test2.all[0]).to.be.an.instanceof(PassingBrowserTest)
      .and.deep.equal({
        browser: 'chrome',
        passing: true,
        duration: 0
      });

    let test3 = test2.update({
      browser: 'firefox',
      failing: true,
      duration: 10
    });

    expect(test3).to.not.equal(test2);
    expect(test3.name).to.equal('test');
    expect(test3.all).to.not.equal(test2.all);
    expect(test3.all[0]).to.equal(test2.all[0]);
    expect(test3.all[1]).to.be.an.instanceof(FailingBrowserTest)
      .and.deep.equal({
        browser: 'firefox',
        failing: true,
        duration: 10,
        errors: []
      });
  });

  it('does not update the test if nothing has changed', () => {
    let test1 = create(Test, { browser: 'chrome', passing: true });
    let test2 = test1.update({ browser: 'chrome', passing: true });

    expect(test1).to.equal(test2);
  });

  describe('status properties', () => {
    let test;

    beforeEach(() => {
      test = create(Test)
        .update({ browser: 'chrome' })
        .update({ browser: 'firefox' });
    });

    it('is pending by default', () => {
      expect(test.pending).to.be.true;
      test = test.update({ browser: 'chrome', passing: true });
      expect(test.pending).to.be.false;
    });

    it('is running when some browsers are running', () => {
      expect(test.running).to.be.false;
      test = test.update({ browser: 'chrome', running: true });
      expect(test.running).to.be.true;
    });

    it('is passing when all browsers are passing', () => {
      expect(test.passing).to.be.false;
      test = test.update({ browser: 'chrome', passing: true });
      expect(test.passing).to.be.false;
      test = test.update({ browser: 'firefox', passing: true });
      expect(test.passing).to.be.true;
    });

    it('is failing when some browsers are failing', () => {
      expect(test.failing).to.be.false;
      test = test.update({ browser: 'chrome', failing: true });
      expect(test.failing).to.be.true;
    });

    it('is skipped when all browsers are skipped', () => {
      expect(test.skipped).to.be.false;
      test = test.update({ browser: 'chrome', skipped: true });
      expect(test.skipped).to.be.false;
      test = test.update({ browser: 'firefox', skipped: true });
      expect(test.skipped).to.be.true;
    });

    it('is finished when all browsers are passing, failing, or skipped', () => {
      expect(test.finished).to.be.false;
      test = test.update({ browser: 'chrome', passing: true });
      expect(test.finished).to.be.false;
      test = test.update({ browser: 'safari', skipped: true });
      expect(test.finished).to.be.false;
      test = test.update({ browser: 'firefox', failing: true });
      expect(test.finished).to.be.true;
    });

    it('contains all browser errors', () => {
      expect(test.errors).to.deep.equal([]);

      test = test.update({
        browser: 'chrome',
        failing: true,
        errors: [{ message: 'chrome error' }]
      });

      expect(test.errors[0]).to.deep.equal({
        name: 'Error',
        browser: 'chrome',
        message: 'chrome error',
        stack: null
      });

      test = test.update({
        browser: 'firefox',
        failing: true,
        errors: [{ message: 'firefox error' }]
      });

      expect(test.errors[1]).to.deep.equal({
        name: 'Error',
        browser: 'firefox',
        message: 'firefox error',
        stack: null
      });
    });
  });
});

describe('Unit: State - BrowserTest', () => {
  let test;

  beforeEach(() => {
    test = create(BrowserTest, { browser: 'chrome' });
  });

  it('has browser, duration, pending, and finished properties', () => {
    expect(test).to.be.an.instanceof(BrowserTest);
    expect(test).to.deep.equal({ browser: 'chrome' });
    expect(test.pending).to.be.true;
    expect(test.finished).to.be.false;
  });

  it('can transition into a running state', () => {
    test = test.update({ running: true });
    expect(test).to.be.an.instanceof(RunningBrowserTest);

    expect(test).to.deep.equal({
      browser: 'chrome',
      running: true
    });

    expect(test.pending).to.be.false;
    expect(test.finished).to.be.false;
  });

  it('can transition into a passing state', () => {
    test = test.update({ passing: true, duration: 10 });
    expect(test).to.be.an.instanceof(PassingBrowserTest);

    expect(test).to.deep.equal({
      browser: 'chrome',
      passing: true,
      duration: 10
    });

    expect(test.pending).to.be.false;
    expect(test.finished).to.be.true;
  });

  it('can transition into a skipped state', () => {
    test = test.update({ skipped: true });
    expect(test).to.be.an.instanceof(SkippedBrowserTest);

    expect(test).to.deep.equal({
      browser: 'chrome',
      skipped: true
    });

    expect(test.pending).to.be.false;
    expect(test.finished).to.be.true;
  });

  it('can transition into a failing state', () => {
    let err = { name: 'Test', message: 'testing' };
    test = test.update({ failing: true, errors: [err] });
    expect(test).to.be.an.instanceof(FailingBrowserTest);

    expect(test).to.deep.include({
      browser: 'chrome',
      failing: true,
      duration: 0
    });

    expect(test.pending).to.be.false;
    expect(test.finished).to.be.true;

    expect(test.errors[0])
      .to.be.an.instanceof(BrowserError)
      .and.deep.equal({
        browser: 'chrome',
        name: 'Test',
        message: 'testing',
        stack: null
      });
  });
});
