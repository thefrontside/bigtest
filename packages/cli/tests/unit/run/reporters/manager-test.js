import { describe, it } from 'mocha';
import { expect, fake } from '@tests/helpers';

import ReporterManager from '@run/reporters';
import BaseReporter from '@run/reporters/base';
import DotReporter from '@run/reporters/dot';

class TestReporter extends BaseReporter {
  static options = 'test';
  process = fake();
}

describe('Unit: Reporter - Manager', () => {
  it('automatically includes local reporters', () => {
    let test = new ReporterManager(['dot']);
    expect(test.reporters).to.have.a.lengthOf(1);
    expect(test.reporters[0]).to.be.an.instanceof(DotReporter);
  });

  it('passes nested options defined by a static options property', () => {
    let test = new ReporterManager(['dot'], { dot: { foo: 'bar' } });
    expect(test.reporters[0].constructor.options).to.equal('dot');
    expect(test.reporters[0].options).to.deep.equal({ foo: 'bar' });
  });

  it('allows custom reporters to be provided', () => {
    let test = new ReporterManager([TestReporter], { test: { hello: 'world' } });
    expect(test.reporters).to.have.a.lengthOf(1);
    expect(test.reporters[0]).to.be.an.instanceof(TestReporter);
    expect(test.reporters[0].options).to.deep.equal({ hello: 'world' });
  });

  it('throws an error when the reporter cannot be found', () => {
    expect(() => new ReporterManager(['test']))
      .to.throw('Cannot find reporter "test"');
  });

  it('throws an error when a valid reporter is not provided', () => {
    expect(() => new ReporterManager([class Test {}]))
      .to.throw('Invalid reporter "Test"');
  });

  it('invokes the process method for all reporters', () => {
    let test = new ReporterManager([TestReporter, TestReporter]);
    test.process(1, 2);

    expect(test.reporters[0].process).to.have.been.calledWith(1, 2);
    expect(test.reporters[1].process).to.have.been.calledWith(1, 2);
  });
});
