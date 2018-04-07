/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, text } from '../../src';

const TextInteractor = interactor(function() {
  this.content = text('.test-span');
});

describe('BigTest Interaction: text', () => {
  let test;

  useFixture('text-fixture');

  beforeEach(() => {
    test = new TextInteractor('#scoped');
  });

  it('has a text property', () => {
    expect(test).to.have.property('text').that.is.a('string');
    expect(test).to.have.property('content').that.is.a('string');
  });

  it('returns the text content', () => {
    expect(test.text).to.equal('Hello World!');
    expect(test.content).to.equal('World!');
  });
});
