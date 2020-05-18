const { test } = require('@bigtest/suite');
const { strict: assert } = require('assert');

module.exports = test("tests")
  .child(
    "test with failing assertion", test => test
      .step("successful step", async () => {})
      .assertion("failing assertion", () => { throw new Error("boom!"); })
      .assertion("successful assertion", () => true))
  .child(
    "tests that track context", test => test
      .step("creates initial context", async () => ({ username: "tyrion" }))
      .step("contributes nothing to context", async () => {})
      .step("extends existing context", async ({ username }) => ({ hello: username }))
      .assertion("contains entire context from all steps", context => {
        assert.deepEqual(context, { username: "tyrion", hello: "tyrion" });
      }))
  .child(
    "test step timeouts", test => test
      .step("this takes literally forever", async () => await new Promise(() => {})));
