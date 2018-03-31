import { describe, beforeEach, afterEach, it } from 'mocha';
import { use, expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import convergeOn from '../src/converge-on';

use(chaiAsPromised);

describe('BigTest Convergence - convergeOn', () => {
  let total, test, timeout;

  beforeEach(() => {
    total = 0;
    test = (num) => convergeOn(() => {
      expect(total).to.equal(num);
    }, 50);
  });

  afterEach(() => {
    if (timeout) {
      clearTimeout(timeout);
    }
  });

  it('resolves when the assertion passes within the timeout', async () => {
    timeout = setTimeout(() => total = 5, 30);

    let start = Date.now();
    await expect(test(5)).to.be.fulfilled;
    expect(Date.now() - start).to.be.within(30, 50);
  });

  it('rejects when the assertion does not pass within the timeout', async () => {
    let start = Date.now();
    await expect(test(5)).to.be.rejectedWith('expected 0 to equal 5');
    expect(Date.now() - start).to.be.within(50, 70);
  });

  it('rejects if the assertion passes, but just after the timeout', async () => {
    timeout = setTimeout(() => total = 5, 51);

    let start = Date.now();
    await expect(test(5)).to.be
      .rejectedWith('convergent assertion was successful, but exceeded the 50ms timeout');
    expect(Date.now() - start).to.be.within(50, 70);
  });

  it('resolves with a stats object', async () => {
    test = (num) => convergeOn(() => total === 5 && total * 100);
    timeout = setTimeout(() => total = 5, 30);

    let start = Date.now();
    let stats = await expect(test(5)).to.be.fulfilled;
    let end = Date.now();

    expect(stats.start).to.be.within(start, start + 1);
    expect(stats.end).to.be.within(end - 1, end);
    expect(stats.elapsed).to.be.within(30, 50);
    expect(stats.runs).to.equal(4);
    expect(stats.always).to.be.false;
    expect(stats.timeout).to.equal(2000);
    expect(stats.value).to.equal(500);
  });

  describe('when `always` is true', () => {
    beforeEach(() => {
      total = 5;
      test = (num) => convergeOn(() => {
        expect(total).to.equal(num);
      }, 50, true);
    });

    it('resolves if the assertion does not fail throughout the timeout', async () => {
      let start = Date.now();
      await expect(test(5)).to.be.fulfilled;
      expect(Date.now() - start).to.be.within(50, 70);
    });

    it('rejects when the assertion fails within the timeout', async () => {
      timeout = setTimeout(() => total = 0, 30);

      let start = Date.now();
      await expect(test(5)).to.be.rejected;
      expect(Date.now() - start).to.be.within(30, 50);
    });
  });

  describe('when the assertion returns `false`', () => {
    beforeEach(() => {
      test = (num) => convergeOn(() => total >= num, 50);
    });

    it('rejects if `false` was continually returned', () => {
      return expect(test(10)).to.be.rejectedWith('convergent assertion returned `false`');
    });

    it('resolves when `false` is not returned', () => {
      timeout = setTimeout(() => total = 10, 30);
      return expect(test(10)).to.be.fulfilled;
    });

    describe('and `always` is true', () => {
      beforeEach(() => {
        test = (num) => convergeOn(() => total < num, 50, true);
      });

      it('resolves if `false` was never returned', () => {
        return expect(test(10)).to.be.fulfilled;
      });

      it('rejects when `false` is returned', () => {
        timeout = setTimeout(() => total = 10, 30);
        return expect(test(10)).to.be.rejectedWith('convergent assertion returned `false`');
      });
    });
  });

  describe('with a slight latency', () => {
    // exploits `while` to block the current event loop
    let latency = (ms) => {
      let start = Date.now();
      let end = start;

      while (end < start + ms) {
        end = Date.now();
      }
    };

    it('rejects as soon as it can after the timeout', async () => {
      let start = Date.now();

      await expect(
        // 5-10ms latencies start causing an increasing amount of
        // flakiness, anything higher fails more often than not
        convergeOn(() => !!latency(20), 50)
      ).to.be.rejected;

      // 10ms loop interval + 20ms latency = ~+30ms final latency
      expect(Date.now() - start).to.be.within(50, 80);
    });

    it('using always resolves as soon as it can after the timeout', async () => {
      let start = Date.now();

      await expect(
        convergeOn(() => latency(20), 50, true)
      ).to.be.fulfilled;

      expect(Date.now() - start).to.be.within(50, 80);
    });
  });
});
