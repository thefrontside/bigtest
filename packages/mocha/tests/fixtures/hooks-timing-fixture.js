import { describe, before, it } from '../../src';
import { expect } from 'chai';
import Convergence from '@bigtest/convergence';

describe('hooks timing', () => {
  let start, end;

  before(function() {
    this.timeout(200);

    return new Convergence()
      .do(() => start = Date.now())
      .always(() => expect(true).to.be.true)
      .do(() => end = Date.now());
  });

  it('runs the convergence within the timeout', () => {
    expect(end - start).to.be.within(180, 200);
  });
});
