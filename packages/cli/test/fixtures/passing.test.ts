import { test } from '@bigtest/suite';

const delay = (time = 50) =>
  async () => { await new Promise(resolve => setTimeout(resolve, time)) };

export default test('Passing Test')
  .step("first step", delay())
  .step("second step", delay())
  .step("third step", delay())
  .assertion("check the thing", delay(3))
  .child(
    "child", test => test
      .step("child first step", delay())
      .step("child second step", delay())
      .step("child third step", delay())
      .assertion("child first assertion", delay(5))
      .assertion("child second assertion", delay(9))
      .assertion("child third assertion", delay(7))
      .assertion("child fourth assertion", delay(3)));
