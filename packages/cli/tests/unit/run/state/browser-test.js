import { describe, beforeEach, it } from 'mocha';
import { expect } from '@tests/helpers';

import create from '@run/state/create';
import Browser, {
  BrowserSocket,
  RunningBrowserSocket,
  FinishedBrowserSocket
} from '@run/state/browser';

describe('Unit: State - Browser', () => {
  it('creates a browser state instance', () => {
    expect(create(Browser)).to.be.an.instanceof(Browser)
      .and.deep.equal({
        id: '',
        name: 'Unknown',
        launched: false,
        sockets: []
      });
  });

  it('has id, name, and launched properties', () => {
    expect(create(Browser, {
      id: '0001',
      name: 'chrome',
      launched: true
    })).to.deep.equal({
      id: '0001',
      name: 'chrome',
      launched: true,
      sockets: []
    });
  });

  it('adds a socket immutably when connecting', () => {
    let test1 = create(Browser, { name: 'chrome' });
    let test2 = test1.connect('01');

    expect(test2).to.not.equal(test1);
    expect(test2.name).to.equal('chrome');
    expect(test2.sockets).to.not.equal(test1.sockets);
    expect(test2.sockets[0]).to.deep.equal({ id: '01' });

    let test3 = test2.connect('02');

    expect(test3).to.not.equal(test2);
    expect(test3.name).to.equal('chrome');
    expect(test3.sockets).to.not.equal(test2.sockets);
    expect(test3.sockets[0]).to.equal(test2.sockets[0]);
    expect(test3.sockets[1]).to.deep.equal({ id: '02' });
  });

  it('does not add an already connected socket', () => {
    let test1 = create(Browser, { name: 'chrome' }).connect('01');
    let test2 = test1.connect('01');

    expect(test2).to.equal(test1);
  });

  it('removes a socket immutably when disconnecting', () => {
    let test1 = create(Browser, { name: 'chrome' });
    test1 = test1.connect('01').connect('02');
    let test2 = test1.disconnect('01');

    expect(test2).to.not.equal(test1);
    expect(test2.name).to.equal('chrome');
    expect(test2.sockets).to.not.equal(test1.sockets);
    expect(test2.sockets[0]).to.equal(test1.sockets[1]);
    expect(test2.sockets[0]).to.deep.equal({ id: '02' });
  });

  it('does not remove an unconnected socket', () => {
    let test1 = create(Browser, { name: 'chrome' }).connect('01');
    let test2 = test1.disconnect('02');

    expect(test2).to.equal(test1);
  });

  it('transitions a socket immutably when running', () => {
    let test1 = create(Browser, { name: 'chrome' });
    test1 = test1.connect('01').connect('02');
    let test2 = test1.run('01');

    expect(test2).to.not.equal(test1);
    expect(test2.name).to.equal('chrome');
    expect(test2.sockets).to.not.equal(test1.sockets);
    expect(test2.sockets[0]).to.not.equal(test1.sockets[0]);
    expect(test2.sockets[1]).to.equal(test1.sockets[1]);
    expect(test2.sockets[0]).to.be.an.instanceof(RunningBrowserSocket)
      .to.deep.equal({ id: '01', running: true });
  });

  it('does not run an unconnected socket', () => {
    let test1 = create(Browser, { name: 'chrome' }).connect('01');
    let test2 = test1.run('02');

    expect(test2).to.equal(test1);
  });

  it('transitions a socket immutably when finishing', () => {
    let test1 = create(Browser, { name: 'chrome' });
    test1 = test1.connect('01').connect('02').run('02');
    let test2 = test1.done('02');

    expect(test2).to.not.equal(test1);
    expect(test2.name).to.equal('chrome');
    expect(test2.sockets).to.not.equal(test1.sockets);
    expect(test2.sockets[0]).to.equal(test1.sockets[0]);
    expect(test2.sockets[1]).to.not.equal(test1.sockets[1]);
    expect(test2.sockets[1]).to.be.an.instanceof(FinishedBrowserSocket)
      .to.deep.equal({ id: '02', finished: true });
  });

  it('does not finish an unconnected socket', () => {
    let test1 = create(Browser, { name: 'chrome' }).connect('01').run('01');
    let test2 = test1.done('02');

    expect(test2).to.equal(test1);
  });

  describe('status properties', () => {
    let test;

    beforeEach(() => {
      test = create(Browser);
    });

    it('is connected when there are sockets', () => {
      expect(test.connected).to.be.false;
      test = test.connect('01');
      expect(test.connected).to.be.true;
      test = test.disconnect('01');
      expect(test.connected).to.be.false;
    });

    it('is waiting when some sockets are not running', () => {
      expect(test.waiting).to.be.false;
      test = test.connect('01');
      expect(test.waiting).to.be.true;
      test = test.run('01');
      expect(test.waiting).to.be.false;
    });

    it('is running when some sockets are running', () => {
      expect(test.running).to.be.false;
      test = test.connect('01').connect('02');
      expect(test.running).to.be.false;
      test = test.run('01');
      expect(test.running).to.be.true;
    });

    it('is finished when all sockets are finished', () => {
      expect(test.finished).to.be.false;
      test = test.connect('01').connect('02').run('01');
      expect(test.finished).to.be.false;
      test = test.done('01');
      expect(test.finished).to.be.false;
      test = test.run('02').done('02');
      expect(test.finished).to.be.true;
    });
  });
});

describe('Unit: State - BrowserSocket', () => {
  let test;

  beforeEach(() => {
    test = create(BrowserSocket, { id: '01' });
  });

  it('has an id and waiting property', () => {
    expect(test).to.be.an.instanceof(BrowserSocket);
    expect(test).to.deep.equal({ id: '01' });
    expect(test.waiting).to.be.true;
  });

  it('can transition into a running state', () => {
    test = test.run();
    expect(test).to.be.an.instanceof(RunningBrowserSocket);
    expect(test).to.deep.equal({ id: '01', running: true });
    expect(test.waiting).to.be.false;
  });

  it('cannot transition into a finished state', () => {
    expect(() => test.done()).to.throw;
  });

  it('can transition from a running state to a finished state', () => {
    test = test.run().done();
    expect(test).to.be.an.instanceof(FinishedBrowserSocket);
    expect(test).to.deep.equal({ id: '01', finished: true });
    expect(test.waiting).to.be.false;
  });
});
