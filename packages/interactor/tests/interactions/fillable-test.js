/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, fillable } from '../../src';

@interactor class FillInteractor {
  fillInput = fillable('.test-input');
}

describe('BigTest Interaction: fillable', () => {
  let test, $input, events;

  useFixture('input-fixture');

  beforeEach(() => {
    events = [];
    $input = document.querySelector('.test-input');
    $input.addEventListener('input', () => events.push('input'));
    $input.addEventListener('change', () => events.push('change'));
    test = new FillInteractor();
  });

  it('has fillable methods', () => {
    expect(test).to.respondTo('fill');
    expect(test).to.respondTo('fillInput');
  });

  it('returns a new instance', () => {
    expect(test.fill('.test-input')).to.not.equal(test);
    expect(test.fill('.test-input')).to.be.an.instanceOf(FillInteractor);
    expect(test.fillInput()).to.not.equal(test);
    expect(test.fillInput()).to.be.an.instanceOf(FillInteractor);
  });

  it('eventually fills the element', async () => {
    await expect(test.fill('.test-input', 'value').run()).to.be.fulfilled;
    expect($input.value).to.equal('value');

    $input.value = '';
    await expect(test.fillInput('other').run()).to.be.fulfilled;
    expect($input.value).to.equal('other');
  });

  it('eventually fires input and change events', async () => {
    await expect(test.fill('.test-input', '').run()).to.be.fulfilled;
    expect(events).to.have.members(['input', 'change']);

    events = [];
    await expect(test.fillInput('').run()).to.be.fulfilled;
    expect(events).to.have.members(['input', 'change']);
  });

  describe('overwriting the default fill method', () => {
    beforeEach(() => {
      test = new (@interactor class {
        fill = fillable('.test-input');
      })();
    });

    it('fills the correct element', async () => {
      await expect(test.fill('something').run()).to.be.fulfilled;
      expect($input.value).to.equal('something');
    });
  });
});
