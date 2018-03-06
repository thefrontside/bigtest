import { describe, before, it } from '../../src';
import { expect } from 'chai';
import Convergence from '@bigtest/convergence';

describe('hooks timing', () => {
  let start;

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
