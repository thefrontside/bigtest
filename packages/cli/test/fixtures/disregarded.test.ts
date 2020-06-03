import { test } from '@bigtest/suite';

const delay = (time = 50) =>
  async () => { await new Promise(resolve => setTimeout(resolve, time)) };

const pass = () => { null; }

export default test('Test with disregarded steps')
  .step("first step", delay())
  .step("second step", delay())
  .step("third step", async () => { throw new Error('third step failed'); })
  .assertion("check the thing", pass)
  .child(
    "child", test => test
      .step("child first step", delay())
      .step("child second step", delay())
      .step("child third step", delay())
      .assertion("child first assertion", pass)
      .assertion("child second assertion", pass)
      .assertion("child third assertion", pass)
      .assertion("child fourth assertion", pass));
