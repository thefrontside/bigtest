const { test } = require('@bigtest/suite');
const { strict: assert } = require('assert');
const { createInteractor, App } = require('@bigtest/interactor');

globalThis.fetch = async function(url) {
  assert.equal(url, '/greeting');
  return {
    async json() {
      return { greeting: "hello from mocked fetch" }
    }
  }
}

const H2 = createInteractor('h2')({ selector: 'h2' });

module.exports = test("tests")
  .step(App.visit('/app.html'))
  .child(
    "test with failing assertion", test => test
      .step("successful step", async () => {
        console.log('this is a good step')

        // during this step we're throwing an uncaught error, it won't affect
        // the result of this step, but should be caught and forwarded to the
        // agent.
        setTimeout(() => {
          throw new Error('uncaught error from test');
        }, 5);
        await new Promise((resolve) => setTimeout(resolve, 10));
      })
      .assertion("failing assertion", async () => {
        console.error('I am going to fail');
        throw new Error("boom!");
      })
      .assertion("successful assertion", async () => true))
  .child(
    "tests that track context", test => test
      .step("creates initial context", async () => ({ username: "tyrion" }))
      .step("contributes nothing to context", async () => {})
      .step("extends existing context", async ({ username }) => ({ hello: username }))
      .assertion("contains entire context from all steps", async context => {
        assert.deepEqual(context, { username: "tyrion", hello: "tyrion" });
      }))
  .child(
    "test step timeouts", test => test
      .step("this takes literally forever", async () => await new Promise(() => {})))
  .child(
    "test fetch", test => test
      .step("fetch is mocked", async () => await H2('hello from mocked fetch').exists()));
