---
id: running-tests
title: Running Tests
---

There are two ways you can run your tests in BigTest: `bigtest ci` and `bigtest test`.

## bigtest ci
The `bigtest ci` command is meant to run in your CI workflow. It starts your app, the BigTest server, runs the tests, and closes everything down on its own. This command can also be used locally when you don't feel the need to debug your app and you just want to run the tests to see if there are any failing tests.

## bigtest test
The main benefit to starting the server and running the tests manually is for debugging purposes. Running the server in a non-headless mode will allow you see the app as the tests run, and the browser won't automatically close after the test are finished running so you will be able to inspect and interact with your app.

Start the server with this command:
```
$ yarn bigtest server --launch=chrome
```
> You can also modify your `bigtest.json` file to start the server in a non-headless browser but then you'll need to remember to revert it to headless if you plan on running BigTest in your CI. And for that reason, we just recommend using the `--launch` flag instead as shown above.

Once the server is running, run this command in a separate terminal:
```
$ yarn bigtest test
```
