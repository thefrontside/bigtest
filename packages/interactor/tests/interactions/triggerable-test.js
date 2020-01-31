/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, triggerable } from '../../src';

@interactor class TriggerInteractor {
  triggerSelf = triggerable('rootEvent', { self: 'righteous' });
  triggerDiv = triggerable('.test-div', 'divEvent', { custom: true });
}

describe('BigTest Interaction: triggerable', () => {
  let test, rootEvent, divEvent;

  useFixture('events-fixture');

  beforeEach(() => {
    rootEvent = divEvent = null;

    document.querySelector('#scoped')
      .addEventListener('rootEvent', (e) => {
        rootEvent = e;
      });

    document.querySelector('.test-div')
      .addEventListener('divEvent', (e) => {
        divEvent = e;
      });

    test = new TriggerInteractor('#scoped');
  });

  it('has triggerable methods', () => {
    expect(test).to.respondTo('trigger');
    expect(test).to.respondTo('triggerSelf');
    expect(test).to.respondTo('triggerDiv');
  });

  it('returns a new instance', () => {
    expect(test.trigger('rootEvent', {})).to.not.equal(test);
    expect(test.trigger('rootEvent', {})).to.be.an.instanceof(TriggerInteractor);
    expect(test.trigger('.test-div', 'divEvent', {})).to.not.equal(test);
    expect(test.trigger('.test-div', 'divEvent', {})).to.be.an.instanceof(TriggerInteractor);
    expect(test.triggerSelf()).to.not.equal(test);
    expect(test.triggerSelf()).to.be.an.instanceof(TriggerInteractor);
    expect(test.triggerDiv()).to.not.equal(test);
    expect(test.triggerDiv()).to.be.an.instanceof(TriggerInteractor);
  });

  it('eventually triggers the event on the element', async () => {
    await expect(test.trigger('rootEvent', { test: 1 }).run()).to.be.fulfilled;
    expect(rootEvent).to.have.property('test', 1);

    await expect(test.trigger('.test-div', 'divEvent', { test: 2 }).run()).to.be.fulfilled;
    expect(divEvent).to.have.property('test', 2);

    await expect(test.triggerSelf().run()).to.be.fulfilled;
    expect(rootEvent).to.have.property('self', 'righteous');

    await expect(test.triggerSelf({ self: 'evident' }).run()).to.be.fulfilled;
    expect(rootEvent).to.have.property('self', 'evident');

    await expect(test.triggerDiv().run()).to.be.fulfilled;
    expect(divEvent).to.have.property('custom', true);

    await expect(test.triggerDiv({ something: 'else' }).run()).to.be.fulfilled;
    expect(divEvent).to.have.property('custom', true);
    expect(divEvent).to.have.property('something', 'else');
  });

  describe('overwriting the default trigger method', () => {
    beforeEach(() => {
      test = new (@interactor class {
        trigger = triggerable('.test-div', 'divEvent');
      })();
    });

    it('triggers the event on the correct element', async () => {
      await expect(test.trigger({ test: 0 }).run()).to.be.fulfilled;
      expect(divEvent).to.have.property('test', 0);
    });
  });
});
