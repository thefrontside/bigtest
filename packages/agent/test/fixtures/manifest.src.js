const { test } = require('@bigtest/suite');

module.exports = test("tests")
  .child(
    "test with failing assertion", test => test
      .step("successful step", async () => {})
      .assertion("failing assertion", () => { throw new Error("boom!"); })
      .assertion("successful assertion", () => true))
