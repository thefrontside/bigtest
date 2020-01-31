import { describe, beforeEach, it } from 'mocha';
import { expect } from '@tests/helpers';

import State, { create } from '@run/state';
import Browser from '@run/state/browser';
import Test from '@run/state/test';

describe('Unit: State', () => {
  it('creates a state instance', () => {
    expect(create(State)).to.be.an.instanceof(State)
      .and.deep.equal({
        ready: false,
        browsers: [],
        tests: []
      });
  });

  it('adds a launched browser state immutably when launching a browser', () => {
    let test1 = create(State);
    let test2 = test1.launchBrowser('0001');

    expect(test2).to.not.equal(test1);
    expect(test2.tests).to.equal(test1.tests);
    expect(test2.browsers).to.not.equal(test1.browsers);
    expect(test2.browsers[0]).to.be.an.instanceof(Browser)
      .and.deep.equal({
        id: '0001',
        name: 'Unknown',
        launched: true,
        sockets: []
      });
  });

  it('does not add a launched browser when already launched', () => {
    let test1 = create(State).launchBrowser('0001');
    let test2 = test1.launchBrowser('0001');

    expect(test2).to.equal(test1);
  });

  it('updates a launched browser\'s name immutably', () => {
    let test1 = create(State).launchBrowser('0001');
    let test2 = test1.updateLaunched({ browser: 'chrome' }, '0001');

    expect(test2).to.not.equal(test1);
    expect(test2.tests).to.equal(test1.tests);
    expect(test2.browsers).to.not.equal(test1.browsers);
    expect(test2.browsers[0]).to.not.equal(test1.browsers[0]);
    expect(test2.browsers[0]).to.deep.equal({
      id: '0001',
      name: 'chrome',
      launched: true,
      sockets: []
    });
  });

  it('does not update a launched browser twice', () => {
    let test1 = create(State).launchBrowser('0001')
      .updateLaunched({ browser: 'chrome' }, '0001');
    let test2 = test1.updateLaunched({ browser: 'chrome' }, '0001');

    expect(test2).to.equal(test1);
  });

  it('does not update browsers that were not launched', () => {
    let test1 = create(State).connectBrowser({ browser: 'chrome', id: '01' });
    let test2 = test1.updateLaunched({ browser: 'chrome' }, '0001');

    expect(test2).to.equal(test1);
  });

  it('adds a new browser immutably when a new browser connects', () => {
    let test1 = create(State);
    let test2 = test1.connectBrowser({ id: '01', browser: 'chrome' });

    expect(test2).to.not.equal(test1);
    expect(test2.tests).to.equal(test1.tests);
    expect(test2.browsers).to.not.equal(test1.browsers);
    expect(test2.browsers[0]).to.be.an.instanceof(Browser)
      .and.property('connected').is.true;
  });

  it('updates a launched browser immutably when adding a connection', () => {
    let test1 = create(State).launchBrowser('0001')
      .updateLaunched({ browser: 'chrome' }, '0001');
    let test2 = test1.connectBrowser({ id: '01', browser: 'chrome' });

    expect(test2).to.not.equal(test1);
    expect(test2.tests).to.equal(test1.tests);
    expect(test2.browsers).to.not.equal(test1.browsers);
    expect(test2.browsers[0]).to.not.equal(test1.browsers[0]);
    expect(test2.browsers[0]).to.be.an.instanceof(Browser)
      .and.property('connected').is.true;
  });

  it('does not update when connecting with an existing connection', () => {
    let meta = { id: '01', browser: 'chrome' };
    let test1 = create(State).connectBrowser(meta);
    let test2 = test1.connectBrowser(meta);

    expect(test2).to.equal(test1);
  });

  it('updates a browser immutably when disconnecting', () => {
    let meta = { id: '01', browser: 'chrome' };
    let test1 = create(State).connectBrowser(meta);
    let test2 = test1.disconnectBrowser(meta);

    expect(test2).to.not.equal(test1);
    expect(test2.tests).to.equal(test1.tests);
    expect(test2.browsers).to.not.equal(test1.browsers);
    expect(test2.browsers[0]).to.not.equal(test1.browsers[0]);
    expect(test2.browsers[0]).to.be.an.instanceof(Browser)
      .and.property('connected').is.false;
  });

  it('does not update when disconnecting if already disconnected', () => {
    let meta = { id: '01', browser: 'chrome' };
    let test1 = create(State).connectBrowser(meta).disconnectBrowser(meta);
    let test2 = test1.disconnectBrowser(meta);

    expect(test2).to.equal(test1);
  });

  it('updates a browser to a running state and adds test states when starting tests', () => {
    let meta = { id: '01', browser: 'chrome' };
    let test1 = create(State).connectBrowser(meta);
    let test2 = test1.startTests(meta, [{ name: 'test', running: true }]);

    expect(test2).to.not.equal(test1);
    expect(test2.tests).to.not.equal(test1.tests);
    expect(test2.browsers).to.not.equal(test1.browsers);
    expect(test2.browsers[0]).to.not.equal(test1.browsers[0]);
    expect(test2.tests[0]).to.be.an.instanceof(Test)
      .and.have.property('running', true);
    expect(test2.browsers[0]).to.be.an.instanceof(Browser)
      .and.have.property('running', true);
  });

  it('does not start tests when the browser is not connected', () => {
    let meta1 = { id: '01', browser: 'chrome' };
    let test1 = create(State).connectBrowser(meta1);
    let meta2 = { id: '02', browser: 'firefox' };
    let test2 = test1.startTests(meta2, [{ name: 'test', failing: true }]);

    expect(test2).to.equal(test1);
  });

  it('updates or adds tests immutably by name and path', () => {
    let meta = { id: '01', browser: 'chrome' };
    let test1 = create(State).connectBrowser(meta)
      .startTests(meta, [
        { name: 'test 1', path: ['context'] },
        { name: 'test 2' }
      ]);

    let test2 = test1.updateTests(meta, [
      { name: 'test 1', path: ['context'], running: true },
      { name: 'test 1', path: ['other context'] },
      { name: 'test 2' }
    ]);

    expect(test2).to.not.equal(test1);
    expect(test2.browsers).to.equal(test1.browsers);
    expect(test2.tests).to.not.equal(test1.tests);
    expect(test2.tests[0]).to.not.equal(test1.tests[0]);
    expect(test2.tests[0]).to.be.an.instanceof(Test)
      .and.have.property('running', true);
    expect(test2.tests[1]).to.equal(test1.tests[1]);
    expect(test2.tests[2]).to.be.an.instanceof(Test)
      .and.deep.equal({
        name: 'test 1',
        path: ['other context'],
        all: [{ browser: 'chrome' }]
      });
  });

  it('does not update tests redundantly', () => {
    let meta = { id: '01', browser: 'chrome' };
    let data = [
      { name: 'test 1', passing: true },
      { name: 'test 2', failing: true }
    ];

    let test1 = create(State)
      .connectBrowser(meta)
      .startTests(meta, data);

    let test2 = test1.updateTests(meta, data);

    expect(test2).to.equal(test1);
  });

  it('updates a running browser to a finished state when ending tests', () => {
    let meta = { id: '01', browser: 'chrome' };
    let test1 = create(State).connectBrowser(meta).startTests(meta, []);
    let test2 = test1.endTests(meta);

    expect(test2).to.not.equal(test1);
    expect(test2.tests).to.equal(test1.tests);
    expect(test2.browsers).to.not.equal(test1.browsers);
    expect(test2.browsers[0]).to.not.equal(test1.browsers[0]);
    expect(test2.browsers[0]).to.be.an.instanceof(Browser)
      .and.property('finished').is.true;
  });

  it('does not update a browser that is not running when ending tests', () => {
    let meta = { id: '01', browser: 'chrome' };
    let test1 = create(State).connectBrowser(meta);
    let test2 = test1.endTests(meta);

    expect(test2).to.equal(test1);
  });

  it('does not update an unknown browser when ending tests', () => {
    let meta = { id: '01', browser: 'chrome' };
    let test1 = create(State).connectBrowser(meta).startTests(meta, []);
    let test2 = test1.endTests({ id: '01', browser: 'firefox' });

    expect(test2).to.equal(test1);
  });

  describe('status properties', () => {
    let chrome = { id: '01', browser: 'chrome' };
    let firefox = { id: '02', browser: 'firefox' };
    let test;

    beforeEach(() => {
      test = create(State)
        .launchBrowser('0001')
        .launchBrowser('0002')
        .updateLaunched(chrome, '0001')
        .updateLaunched(firefox, '0002');
    });

    it('is ready when all lauched browsers have connected', () => {
      expect(test.ready).to.be.false;
      test = test.connectBrowser(chrome);
      expect(test.ready).to.be.false;
      test = test.connectBrowser(firefox);
      expect(test.ready).to.be.true;
    });

    it('remains ready when launched browsers disconnect', () => {
      expect(test.ready).to.be.false;

      test = test
        .connectBrowser(chrome)
        .connectBrowser(firefox);

      expect(test.ready).to.be.true;
      test = test.disconnectBrowser(firefox);
      expect(test.ready).to.be.true;
    });

    it('is started when there are tests present', () => {
      expect(test.started).to.be.false;

      test = test
        .connectBrowser(chrome)
        .startTests(chrome, [{ name: 'test' }]);

      expect(test.started).to.be.true;
    });

    it('is finished when all browsers are finished', () => {
      let safari = { id: '003', browser: 'safari' };
      expect(test.finished).to.be.false;

      test = test
        .connectBrowser(chrome)
        .connectBrowser(firefox)
        .connectBrowser(safari)
        .startTests(chrome, [])
        .startTests(firefox, [])
        .startTests(safari, []);

      expect(test.finished).to.be.false;

      test = test
        .endTests(chrome)
        .endTests(firefox);

      expect(test.finished).to.be.false;
      test = test.endTests(safari);
      expect(test.finished).to.be.true;
    });

    it('has a status property', () => {
      expect(test.status).to.equal(0);
    });

    it('has a non-zero status when there are failures', () => {
      test = test.startTests(chrome, [{ name: 'test' }]);
      expect(test.status).to.equal(0);
      test = test.updateTests(chrome, [{ name: 'test', failing: true }]);
      expect(test.status).to.equal(1);
    });
  });
});
