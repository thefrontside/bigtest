/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, computed, action } from '../../src';

const HelperInteractor = interactor(function() {
  this.content = computed(function() {
    return this.$().innerText;
  });

  this.doSomething = action(function() {
    return this;
  });
});

describe('BigTest Interaction: helpers', () => {
  let test;

  useFixture('find-fixture');

  beforeEach(() => {
    test = new HelperInteractor();
  });

  it('has a computed property', () => {
    expect(test).to.have.property('content').that.is.a('string');
  });

  it('has an interaction method', () => {
    expect(test).to.respondTo('doSomething');
  });
});
