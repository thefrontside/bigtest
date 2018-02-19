/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { Interaction, page, triggerable } from '../../src';

describe('BigTest Interaction: triggerable', () => {
  let triggered, triggeredEvent;

  useFixture('events-fixture');

  beforeEach(() => {
    triggered = false;

    document.querySelector('.test-div')
      .addEventListener('myEvent', (e) => {
        triggered = true;
        triggeredEvent = e;
      });
  });

  describe('Interaction', () => {
    let interaction;

    beforeEach(() => {
      interaction = new Interaction();
    });

    it('has a trigger method', () => {
      expect(interaction).to.respondTo('trigger');
    });

    it('is immutable', () => {
      let trigger = interaction.trigger('.test-div', 'myEvent');
      expect(trigger).to.not.equal(interaction);
      expect(trigger).to.be.an.instanceof(Interaction);
    });

    it('eventually triggers the event on the element', async () => {
      let trigger = interaction.trigger('.test-div', 'myEvent', { custom: 'hi' });
      await expect(trigger.run()).to.be.fulfilled;
      expect(triggered).to.be.true;
      expect(triggeredEvent).to.have.property('custom', 'hi');
    });

    it('eventually triggers the event on the scoped element', async () => {
      let trigger = new Interaction('.test-div').trigger('myEvent', { root: true });
      await expect(trigger.run()).to.be.fulfilled;
      expect(triggered).to.be.true;
      expect(triggeredEvent).to.have.property('root', true);
    });
  });

  describe('Page Object', () => {
    let TestPage;

    beforeEach(() => {
      TestPage = page(class TestPage {
        constructor() {
          this.triggerEvent = triggerable('myEvent', '.test-div', { custom: true });
          this.triggerSelf = triggerable('myEvent', { self: 'righteous' });
        }
      });
    });

    it('has a trigger method', () => {
      expect(new TestPage().trigger).to.be.a('function');
    });

    it('has a custom triggerable method', () => {
      expect(new TestPage().triggerEvent).to.be.a('function');
    });

    it('returns a custom interaction', () => {
      let trigger = new TestPage().triggerEvent();
      expect(trigger).to.be.an.instanceOf(TestPage.Interaction);
      expect(trigger).to.be.an.instanceOf(Interaction);
    });

    it('has a chainable interface', () => {
      let trigger = new TestPage().triggerEvent();
      expect(trigger.triggerEvent).to.be.a('function');
    });

    it('eventually triggers the event on a given element', async () => {
      let trigger = new TestPage().trigger('.test-div', 'myEvent');
      await expect(trigger.run()).to.be.fulfilled;
      expect(triggered).to.be.true;
    });

    it('eventually triggers the event on a specified element', async () => {
      let trigger = new TestPage().triggerEvent();
      await expect(trigger.run()).to.be.fulfilled;
      expect(triggered).to.be.true;
      expect(triggeredEvent).to.have.property('custom', true);
    });

    it('eventually triggers the event on the root element', async () => {
      let trigger = new TestPage('.test-div').triggerSelf();
      await expect(trigger.run()).to.be.fulfilled;
      expect(triggered).to.be.true;
      expect(triggeredEvent).to.have.property('self', 'righteous');
    });
  });
});
