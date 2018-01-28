/* global describe, beforeEach, it */
import { expect } from 'chai';
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

  it('has a convergence interface', () => {
    ['once', 'always', 'do', 'timeout', 'run'].forEach((method) => {
      expect(interaction).to.respondTo(method);
    });
  });

  it('has the ability to register new helpers', async () => {
    let test = false;

    Interaction.register('test', function() {
      return this.do(() => test = true);
    });

    let newInteraction = new Interaction();

    expect(newInteraction).to.respondTo('test');

    let testInteraction = interaction.test();

    expect(testInteraction).to.not.equal(newInteraction);
    expect(test).to.be.false;

    let promise = testInteraction.run();

    await expect(promise).to.be.fulfilled;
    expect(test).to.be.true;
  });

  it('cannot re-register convergence methods', () => {
    ['once', 'always', 'do', 'timeout', 'run'].forEach((method) => {
      expect(() => Interaction.register(method, () => {}))
        .to.throw('cannot overwrite convergence methods');
    });
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
      expect(() => scoped.$scope).to.throw('unable to select "#not-scoped"');
    });
  });
});
