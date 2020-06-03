import { test } from '@bigtest/suite';

const delay = (time = 50) =>
  async () => { await new Promise(resolve => setTimeout(resolve, time)) };

const pass = () => { null; }
const fail = () => { throw new Error('fail'); }

export default test('Failing Test')
  .step("first step", delay())
  .step("second step", delay())
  .step("third step", delay())
  .assertion("check the thing", fail)
  .child(
    "child", test => test
      .step("child first step", delay())
      .step("child second step", delay())
      .step("child third step", delay())
      .assertion("child first assertion", pass)
      .assertion("child second assertion", fail)
      .assertion("child third assertion", pass)
      .assertion("child fourth assertion", pass));
