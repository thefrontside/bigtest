const { visit } = require('bigtest')
const { test } = require('@bigtest/suite');
const { bigtestGlobals } = require('@bigtest/globals');
const { strict: assert } = require('assert');
const { HTML } = require('@interactors/html');

const localforage = require('localforage');

const { coverageData } = require('./coverage-data');

globalThis.fetch = async function(url) {
  assert.equal(url, '/greeting');
  return {
    async json() {
      return { greeting: "hello from mocked fetch" }
    }
  }
}

function storageTest(test) {
  return test
    .assertion("nothing starts in local storage", async () => {
      assert.equal(localStorage.getItem('hello'), null)
      assert.equal(sessionStorage.getItem('hello'), null)
    })
    .child(
      "dirty the storage", test => test
        .step("add keys to storages", async() => {
          localStorage.setItem('hello', 'world');
          sessionStorage.setItem('hello', 'world');

        })
    )
}

function indexedDBTest(test) {
  return test
    .step("setup db", async () => ({
      store: localforage.createInstance({
        name: 'test',
        driver: localforage.INDEXEDDB
      })
    }))
    .assertion("nothing starts in indexedDB", async ({ store }) => {
      assert.equal(await store.getItem('hello'), null)
    })
    .child(
      "dirty the storage", test => test
        .step("add keys to storages", async({ store }) => {
          await store.setItem('hello', 'world');
        })
    )
}

function coverageTest(filepath) {
  return test => test
    .step(`add coverage data from ${filepath}`, async () => {
      if (!coverageData[filepath]) {
        throw new Error(`bad test! no fixture coverage data for filepath ${filepath}`);
      }
      bigtestGlobals.testFrame.contentWindow.window.__coverage__ = { [filepath]: coverageData[filepath]};
    })
}

module.exports = test("tests")
  .step(visit('/app.html'))
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
    "tests that track context without async", test => test
      .step("creates initial context", () => ({ username: "tyrion" }))
      .step("contributes nothing to context", () => {})
      .step("extends existing context", ({ username }) => ({ hello: username }))
      .assertion("contains entire context from all steps", context => {
        assert.deepEqual(context, { username: "tyrion", hello: "tyrion" });
      }))
  .child(
    "test step timeouts", test => test
      .step("this takes literally forever", async () => await new Promise(() => {})))
  .child(
    "test fetch", test => test
      .step("fetch is mocked", async () => await HTML('hello from mocked fetch').exists()))
  .child("local storage and session storage 1", storageTest)
  .child("local storage and session storage 2", storageTest)
  .child("indexedDB 1", indexedDBTest)
  .child("indexedDB 2", indexedDBTest)
  .child("add coverage 1", coverageTest("src/Signin.js"))
  .child("add coverage 2", coverageTest("src/index.js"))
