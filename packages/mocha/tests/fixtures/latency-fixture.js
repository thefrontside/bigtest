import {
  describe,
  before,
  beforeEach,
  after,
  afterEach,
  it
} from '../../src';
import { expect } from 'chai';

describe('latency', function() {
  it('has a latency method with a default value', function() {
    expect(this.latency()).to.equal(100);
  });

  it('can modify the latency', function() {
    expect(this.latency()).to.equal(200);
  }).latency(200);

  it('adds to the mocha timeout', function() {
    expect(this.timeout()).to.equal(250);
  }).timeout(200).latency(50);

  describe('for an entire suite', function() {
    this.latency(400);

    it('respects the suite-level latency', function() {
      expect(this.latency()).to.equal(400);
    });

    it('can still modify the latency', function() {
      expect(this.latency()).to.equal(100);
    }).latency(100);
  });

  describe('hooks', function() {
    before(function() {
      expect(this.latency()).to.equal(100);
      this.latency(150);
      expect(this.latency()).to.equal(150);
    });

    beforeEach(function() {
      expect(this.latency()).to.equal(100);
      this.latency(200);
      expect(this.latency()).to.equal(200);
    });

    after(function() {
      expect(this.latency()).to.equal(100);
      this.latency(250);
      expect(this.latency()).to.equal(250);
    });

    afterEach(function() {
      expect(this.latency()).to.equal(100);
      this.latency(250);
      expect(this.latency()).to.equal(250);
    });

    it('have their own latency', function() {
      expect(this.latency()).to.equal(100);
    });
  });
});
