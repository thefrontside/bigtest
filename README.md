<p align="center">
  <img alt="BigTest" src="logo.svg" width="500">
</p>

<p align="center">
  <img alt="Test Status" src="https://github.com/thefrontside/bigtest/workflows/Test%20Ubuntu/badge.svg" />
  <a href="https://discord.gg/r6AvtnU">
    <img alt="Chat on Discord" src="https://img.shields.io/discord/700803887132704931?Label=Discord)](https://discord.gg/r6AvtnU" />
  </a>
  <a href="https://frontside.com">
    <img alt="created by Frontside" src="https://img.shields.io/badge/created%20by-frontside-26abe8.svg" />
  </a>
</p>

<p align="center">
  A Suite of JavaScript libraries and framework extensions to help you
  answer the question:</br><i>Does my application work in real life?</i>
</p>



---

BigTest is an innovative new test runner. It is built to test any web
application in any browser and do it with great performance and test stability.

> BigTest is under heavy development, we are currently at an alpha stage of
> development, and adventurous users can start using BigTest today. Want to
> help us get to Beta? Check out the [beta milestone](https://github.com/thefrontside/bigtest/milestone/2) and help us
> cross the finish line!

### Real Applications

The surest way to know if an application is going to work is to actually run
it. BigTest is built to work with any web application out of the box and
requires *zero* integration inside your application code. From frontend
applications to server side rendered, React, Angular, Vue, Ember and so on… If
you can build it, you can test it.

### Real Browsers

Does your appication run in a browser? Then if a test is going to measure
whether it works or not, it also needs to run in a *real* browser that a *real*
user might use. BigTest is built from the ground up to work with *any* browser,
including mobile browsers.

### Real Stability

Testing big is hard because there can be hundreds if not thousands of things
happening concurrently inside your application, including user interactions. We
have taken great care to make sure BigTest tests do not suffer from the
flakiness issues often associated with big tests. Read about [how we eliminate flakiness on our blog](https://frontside.com/blog/2020-07-16-the-lesson-of-bigtest-interactors/).

## Getting started

BigTest is currently alpha level software and we are still building
documentation, so be prepared for some roughness around the edges, but if you
already want to give it a go, here is how you can get going:

Install bigtest in your application:

```
yarn add bigtest @bigtest/cli @bigtest/suite @bigtest/interactor
```

Add a `bigtest.json` file in the root of your project with a base configuration like this:

``` json
{
  "app": {
    "command": "yarn start",
    "env": { "PORT": 36000 },
    "url": "http://localhost:36000"
  },
  "launch": ["chrome.headless"]
}
```

You can replace `yarn start` with however you start your application. In the
future there will be an `init` command to set up this file.

Add a test file in `test/my-test.test.js`:

``` javascript
import { App, Headline } from '@bigtest/interactor';
import { test } from '@bigtest/suite';

export default test('My Test')
  .step(App.visit('/'));
  .step(Headline("My Application").exists());
```

Start the BigTest server:

```
yarn bigtest server
```

And run your tests:

```
yarn bigtest run
```

## Development

### Installation

1. Clone this repository `git clone git@github.com:thefrontside/bigtest.git`
2. Run `yarn`

### Building

Many of the packages in this repository depend on each other in order
to function. However, being assembled from TypeScript and HTML
webapps, these packages need to be built before they can be
consumed. In order to build dependencies

``` shell
$ yarn prepack
```

This will compile each package into the state in which it will
ultimately appear on NPM.

### Running tests

1. Run `yarn` to ensure that all dependencies are installed
2. Run `yarn prepack` to build all packages
3. Run `yarn test` to run automated tests

### Running lints

1. Run `yarn` to ensure that all dependencies are installed
2. Run `yarn prepack` to build all packages
3. Run `yarn lint` to run linters
