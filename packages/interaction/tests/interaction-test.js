/* global describe, beforeEach, it */
import { expect } from 'chai';
import Convergence from '@bigtest/convergence';
import { useFixture } from './helpers';
import Interaction from '../src/interaction';

describe('BigTest Interaction: Interaction', () => {
  let interaction;

  beforeEach(() => {
    interaction = new Interaction();
  });

  it('creates a new instance', () => {
    expect(interaction).to.be.an.instanceOf(Interaction);
  });

  it('extends the convergence class', () => {
    expect(interaction).to.be.an.instanceOf(Convergence);
  });

  it('has a `pause` method', () => {
    expect(interaction).to.respondTo('pause');
    expect(interaction.pause()).to.be.an.instanceOf(Interaction);
    expect(interaction.pause()).to.not.equal(interaction);
  });

  it('is extendable', async () => {
    let test = false;

    class CustomInteraction extends Interaction {
      test() {
        return this.do(() => test = true);
      }
    };

    interaction = new CustomInteraction();
    expect(interaction).to.respondTo('test');

    let testInteraction = interaction.test();

    expect(testInteraction).to.not.equal(interaction);
    expect(test).to.be.false;

    await expect(testInteraction.run()).to.be.fulfilled;
    expect(test).to.be.true;
  });

  describe('with a scope', () => {
    useFixture('scoped-fixture');

    it('has a default scope', () => {
      expect(interaction.$scope).to.equal(document.body);
    });

    it('can be scoped', () => {
      let scoped = new Interaction('#scoped');

      expect(scoped.$scope).to.not.equal(document.body);
      expect(scoped.$scope.id).to.equal('scoped');
    });

    it('can be scoped by element', () => {
      let $scope = document.getElementById('scoped');
      let scoped = new Interaction($scope);

      expect(scoped.$scope).to.not.equal(document.body);
      expect(scoped.$scope).to.equal($scope);
    });

    it('throws when scope does not exist', () => {
      let scoped = new Interaction('#not-scoped').timeout(50);
      expect(() => scoped.$scope).to.throw('unable to find "#not-scoped"');
    });
  });
});
