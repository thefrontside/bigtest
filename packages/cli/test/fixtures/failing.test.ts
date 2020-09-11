import { test } from '@bigtest/suite';

const delay = (time = 50) =>
  async () => { await new Promise(resolve => setTimeout(resolve, time)) };

export default test('Failing Test')
  .step("first step", delay())
  .step("second step", delay())
  .step("third step", delay())
  .assertion("check the thing", delay(3))
  .assertion("failed assertion", async () => { throw new Error('moo') })
  .child(
    "child", test => test
      .step("child first step", delay())
      .step("child second step", async () => { throw new Error('moo') })
      .step("child third step", delay())
      .assertion("child first assertion", delay(5)));
