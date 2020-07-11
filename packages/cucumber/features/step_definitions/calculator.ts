import { Given, When, And, Then } from '../../src';

// import { App } from '@bigtest/interactor';

Given('I take the number {int}', (n: number) => {
  return { left: Number(n) };
});

When('I take the number {int}', (n: number) => {
  return { right: Number(n) };
});

And('I add them', ({ left, right }) => {
  return { result: left + right };
});

Then('I will have {int}', ({ result }) => {
  console.log(`the result is ${result}`);
});
