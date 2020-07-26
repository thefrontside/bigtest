import { stepRegistry } from './steps/step-registry';

export const { Given, When, And, Then } = stepRegistry.methods;

export * from './rollup/rollup-bigtest-cucumber-plugin';
