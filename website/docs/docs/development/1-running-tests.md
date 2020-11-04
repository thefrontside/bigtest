---
id: running-tests
title: Running Tests
---

There are two ways you can run BigTest. Using `yarn bigtest ci`, as seen in our [example](your-first-test), will start both the BigTest server and your app, run the tests, and close it all down.

The other way would be to start the server yourself and trigger the tests separately:
```
$ yarn bigtest server --launch chrome
```
[screenshot?]

And in a separate terminal:
```
$ yarn bigtest test
```
[screenshot?]

The default configs will run your server in `chrome.headless` so we recommend using the `--launch` flag to start your server as shown above.

_see [api/cli] for command details_

The main benefit to starting the server and running the tests manually is for debugging purposes.

Running the server in non-headless mode will allow you see the app as the tests run, and the browser won't automatically close after the test are finished running so you will be able to interact with your app.

_BigTest supports multi-browser parallel testing. Read more about it [here](link)._
