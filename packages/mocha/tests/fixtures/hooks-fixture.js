import {
  describe,
  before,
  beforeEach,
  after,
  afterEach,
  it
} from '../../src';
import { expect } from 'chai';
import Convergence from '@bigtest/convergence';

describe('hooks', () => {
  let test;

  describe('before', () => {
    before(() => {
      return new Convergence()
        .do(() => test = true);
    });

    after(() => {
      return new Convergence()
        .do(() => test = false);
    });

    it('runs the before convergence', () => {
      expect(test).to.be.true;
    });
  });

  describe('after', () => {
    it('runs the after convergence', () => {
      expect(test).to.be.false;
    });
  });

  describe('beforeEach', () => {
    beforeEach(() => {
      return new Convergence()
        .do(() => test = 'hello');
    });

    afterEach(() => {
      return new Convergence()
        .do(() => test = 'goodbye');
    });

    it('runs the beforeEach convergence', () => {
      expect(test).to.equal('hello');
    });
  });

  describe('afterEach', () => {
    it('runs the afterEach convergence', () => {
      expect(test).to.equal('goodbye');
    });
  });

  describe('existing functionality', () => {
    describe('before & beforeEach', () => {
      before(() => {
        return Promise.resolve()
          .then(() => test = 0);
      });

      beforeEach(() => {
        return Promise.resolve()
          .then(() => test += 5);
      });

      after(() => {
        return Promise.resolve()
          .then(() => test -= 2);
      });

      afterEach(() => {
        return Promise.resolve()
          .then(() => test -= 2);
      });

      it('still works', () => {
        expect(test).to.equal(5);
      });
    });

    describe('after & afterEach', () => {
      it('still works', () => {
        expect(test).to.equal(1);
      });
    });
  });
});
