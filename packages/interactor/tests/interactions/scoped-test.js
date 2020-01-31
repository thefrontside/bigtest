/* global describe, beforeEach, it */
import { expect } from 'chai';
import { useFixture } from '../helpers';
import { interactor, scoped, text, fillable } from '../../src';

@interactor class FieldInteractor {
  label = text('.test-label');
  fillIn = fillable('input');
}

@interactor class ScopedInteractor {
  simple = scoped('.test-field');
  field = scoped('.test-field', FieldInteractor);
}

describe('BigTest Interaction: scoped', () => {
  let test;

  useFixture('field-fixture');

  beforeEach(() => {
    test = new ScopedInteractor();
  });

  it('has scoped properties', () => {
    expect(test).to.have.property('simple');
    expect(test).to.have.property('field');
  });

  it('has a scoped method', () => {
    expect(test).to.respondTo('scoped');
  });

  it('returns a nested interactor', () => {
    expect(test.simple).to.have.property('$root')
      .that.has.property('className', 'test-field');
    expect(test.field).to.be.an.instanceOf(FieldInteractor).and.respondTo('only');
    expect(test.scoped('.test-field', FieldInteractor))
      .to.be.an.instanceOf(FieldInteractor).and.respondTo('only');
  });

  it('has nested interactions', async () => {
    let value;

    expect(test.field).to.be.an.instanceOf(FieldInteractor);
    expect(test.field).to.have.property('label', 'Test');

    test.field.$('input')
      .addEventListener('change', e => value = e.target.value);

    await test.field.fillIn('hello');

    expect(value).to.equal('hello');
  });

  it('returns parent instances from nested interaction methods', () => {
    expect(test.field.click()).to.not.equal(test);
    expect(test.field.click()).to.be.an.instanceOf(ScopedInteractor);
    expect(test.scoped('.test-field').click()).to.be.an.instanceOf(ScopedInteractor);
  });

  it('returns own instances after calling #only()', () => {
    expect(test.field.only()).to.be.an.instanceOf(FieldInteractor);
    expect(test.field.only().click()).to.be.an.instanceOf(FieldInteractor);
  });

  it('lazily throws an error when the element does not exist', () => {
    let field = new ScopedInteractor('#non-existent').field;

    return expect(() => field.$root)
      .to.throw('unable to find "#non-existent"');
  });
});
