import { Given, When, Then } from 'cucumber';

let And = When;

let left = 0;
let right = 0;
let result = 0;

Given('I take the number {int}', (n: number) => {
  console.log('Given');
  left = Number(n);
});

When('I take the number {int}', (n: number) => {
  right = Number(n);
});

And('I add them', () => {
  result = left + right;
});

Then('I will have {int}', () => {
  console.log(result);
});
