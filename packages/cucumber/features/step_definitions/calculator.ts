import { Given, When, Then, And } from '../../src';

Given('I take the number {int}', (first: number) => {
  return { first: Number(first) };
});

When('I add the number {int}', (second: number) => {
  return { second: Number(second) };
});

And('I add another number {int}', (third: number) => {
  return { third: Number(third) };
});

Then('I will have {int}', (expected: number, { first, second, third }) => {
  console.log(`the result is ${expected === first + second + third}`);
});
