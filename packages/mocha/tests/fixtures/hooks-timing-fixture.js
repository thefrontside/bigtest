import { describe, before, beforeEach, it } from '../../src';
import { expect } from 'chai';
import Convergence from '@bigtest/convergence';

describe('hooks timing', () => {
  let start;

  describe('with the context helper', () => {
    before(function() {
      this.timeout(200);

      return new Convergence()
        .do(() => start = Date.now())
        .always(() => expect(true).to.be.true);
    });

    it('runs the convergence within the timeout', () => {
      expect(Date.now() - start).to.be.within(200, 220);
    });
  });

  describe('inherited from the suite', function() {
    this.timeout(200);

    beforeEach(() => {
      return new Convergence()
        .do(() => start = Date.now())
        .always(() => expect(true).to.be.true);
    });

    it('runs the convergence within the timeout', () => {
      expect(Date.now() - start).to.be.within(200, 220);
    });

    it('continues running the convergence within the timeout', () => {
      expect(Date.now() - start).to.be.within(200, 220);
    });
  });
});
