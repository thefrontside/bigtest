import { test } from '@bigtest/suite';

export default test('Passing Test')
  .step("a step", async() => {
    let foo: number = "bar"
    console.log(foo);
  });
