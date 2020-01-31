import { describe, it } from 'mocha';
import { expect, fake } from '@tests/helpers';

import PluginManager from '@run/plugins';
import BasePlugin from '@run/plugins/base';
import AdapterPlugin from '@run/plugins/adapter';
import ServePlugin from '@run/plugins/serve';

class TestPlugin extends BasePlugin {
  static options = 'test';
  setup = fake();
  start = fake();
  stop = fake();
}

describe('Unit: Plugin - Manager', () => {
  it('automatically includes local plugins', () => {
    let test = new PluginManager(['serve']);
    expect(test.plugins).to.have.a.lengthOf(1);
    expect(test.plugins[0]).to.be.an.instanceof(ServePlugin);
  });

  it('passes nested options defined by a static plugin property', () => {
    let test = new PluginManager(['serve'], { serve: { foo: 'bar' } });
    expect(test.plugins[0].constructor.options).to.equal('serve');
    expect(test.plugins[0].options).to.deep.equal({ foo: 'bar' });
  });

  it('automatically enables the serve plugin when serve options are provided', () => {
    let test = new PluginManager([], { serve: { foo: 'bar' } });
    expect(test.plugins).to.have.a.lengthOf(1);
    expect(test.plugins[0]).to.be.an.instanceof(ServePlugin);
    expect(test.plugins[0].options).to.deep.equal({ foo: 'bar' });
  });

  it('automatically enables the adapter plugin when adapter options are provided', () => {
    let test = new PluginManager([], { adapter: { name: 'mocha' } });
    expect(test.plugins).to.have.a.lengthOf(1);
    expect(test.plugins[0]).to.be.an.instanceof(AdapterPlugin);
    expect(test.plugins[0].options).to.deep.include({ name: 'mocha' });
  });

  it('allows custom plugins to be provided', () => {
    let test = new PluginManager([TestPlugin], { test: { hello: 'world' } });
    expect(test.plugins).to.have.a.lengthOf(1);
    expect(test.plugins[0]).to.be.an.instanceof(TestPlugin);
    expect(test.plugins[0].options).to.deep.equal({ hello: 'world' });
  });

  it('throws an error when the plugin cannot be found', () => {
    expect(() => new PluginManager(['test']))
      .to.throw('Cannot find plugin "test"');
  });

  it('throws an error when a valid plugin is not provided', () => {
    expect(() => new PluginManager([class Test {}]))
      .to.throw('Invalid plugin "Test"');
  });

  it('invokes setup for all plugins', () => {
    let test = new PluginManager([TestPlugin, TestPlugin]);
    test.setup(1, 2, 3, 4);

    expect(test.plugins[0].setup).to.have.been.calledWith(1, 2, 3, 4);
    expect(test.plugins[1].setup).to.have.been.calledWith(1, 2, 3, 4);
  });

  it('invokes start for all plugins and resolves when done', async () => {
    let test = new PluginManager([TestPlugin, TestPlugin]);
    await expect(test.start()).to.be.fulfilled;

    expect(test.plugins[0].start).to.have.been.calledOnce;
    expect(test.plugins[1].start).to.have.been.calledOnce;
  });

  it('invokes start for all plugins and rejects when one does', async () => {
    let test = new PluginManager([TestPlugin, TestPlugin, TestPlugin]);

    test.plugins[1].start = fake.throws('fail');
    await expect(test.start()).to.be.rejectedWith('fail');

    expect(test.plugins[0].start).to.have.been.calledOnce;
    expect(test.plugins[1].start).to.have.been.calledOnce;
    expect(test.plugins[2].start).to.have.not.been.called;
  });

  it('invokes stop for all plugins and resolves when done', async () => {
    let test = new PluginManager([TestPlugin, TestPlugin]);
    await expect(test.stop()).to.be.fulfilled;

    expect(test.plugins[0].stop).to.have.been.calledOnce;
    expect(test.plugins[1].stop).to.have.been.calledOnce;
  });

  it('invokes stop for all plugins and rejects when one does', async () => {
    let test = new PluginManager([TestPlugin, TestPlugin, TestPlugin]);

    test.plugins[1].stop = fake.throws('fail');
    await expect(test.stop()).to.be.rejectedWith('fail');

    expect(test.plugins[0].stop).to.have.been.calledOnce;
    expect(test.plugins[1].stop).to.have.been.calledOnce;
    expect(test.plugins[2].stop).to.have.not.been.called;
  });
});
