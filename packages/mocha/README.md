# @bigtest/mocha

Convergent Mocha functions for testing against asynchronous states

## Synopsis

``` javascript
import { describe, beforeEach, it } from '@bigtest/mocha';
import { expect } from 'chai';

describe('clicking my button', () => {
  beforeEach(() => $button.click());

  // repeatedly asserts until passing
  it('shows a loading indicator', () => {
    expect($button.className).to.include('is-loading');
  });

  // repeatedly asserts it is passing until the timeout
  it.always('does not navigate away', () => {
    expect(app.location).to.equal('/')
  }).timeout(200);
})
```

## Convergent Assertions

Typically, when testing asynchronous states (such as rendered content
in an application) your tests need to run at just the right moment so
that they are executed in the correct context. If your tests run too
soon, they will fail; if they run too slow, well then you just have
slow tests.

Converging on a state means asserting against a state until the
assertion passes, in which case you have successfully converged on
that state!

This package uses
[`@bigtest/convergence`](https://github.com/thefrontside/bigtest/tree/master/packages/convergence)
to repeatedly run assertions until they pass, or until the timeout has
expired. Performing tests in this way allows them to pass the moment
the desired state is achieved. This results in very fast tests when
testing asynchronous things.

_Read the `@bigtest/convergence` [docs on
convergences](https://github.com/thefrontside/bigtest/tree/master/packages/convergence#why-convergence)
for more info as to why converging on a desired state is better than
trying to time it properly._

## How does it work?

For the most part, you write tests in the exact same way that you're
used to writing tests with Mocha. The only difference is that this
package wraps Mocha's `it` in a convergence helper so that any
assertions you write using `it` become convergent assertions that
allow you to easily test asynchronous states.

This package also wraps the Mocha hooks `before`, `after`,
`beforeEach`, and `afterEach` to support automatically timing and
running returned `Convergence` instances from `@bigtest/convergence`.

### Writing Tests

Because convergent assertions are run repeatedly until they pass, it
is _highly recommended_ that you **do not** perform any side-effects
in your assertions. This will result in your side-effect being run
multiple, perhaps even hundreds of times.

For this reason, you should keep your side-effect producing code in
hooks and **out of your assertions.** These "pure assertions" also
help your tests be more readable and explicit.

#### :no_entry_sign: do not do this:

``` javascript
describe('my button', () => {
  it('shows a loading indicator after clicking', () => {
    // this will be called every time the assertion runs
    $button.click();

    // it might take a few milliseconds for any side-effects to
    // happen, so this might fail the first time and cause this entire
    // assertion to run again, thus clicking the button again
    expect($button.className).to.include('is-loading');
  });
});
```

#### :white_check_mark: do this:

``` javascript
describe('clicking my button', () => {
  // keep side-effects inside hooks
  beforeEach(() => $button.click());

  // a pure assertion has no side-effects; even if it fails, it can
  // be run again and again without consequence
  it('shows a loading indicator', () => {
    expect($button.className).to.include('is-loading');
  });
});
```

#### Asserting that something _has not happened_

Another common scenario is asserting that something **has not**
happened. If you were to test for this normally (or even with a
convergent assertion above) the test could potentially pass
successfully before a side-effect has time to even happen.

In these scenarios, you want to converge when the state meets an
expectation _for a given period of time_. In other words, "if this
assertion remains true for X amount of time, this test is considered
to be passing."

`@bigtest/mocha` provides an `it.always` method to do just this. This
method will run the assertion throughout the entire timeout period
ensuring it never fails. When the assertion does fail, the test
fails. If the assertion never fails, it will pass just after the
timeout period.

``` javascript
describe('clicking my button', () => {
  beforeEach(() => $button.click());

  // the default timeout for it.always is 100ms
  it.always('does not navigate away for at least 1 second', () => {
    expect(app.location).to.equal('/');
  }).timeout(1000);
});
```

### Convergent Hooks

Sometimes you may attempt to perform an async task to find it fails
due to a preconceived state not being met. For example, you can't
click a button if it doesn't exist in the DOM. You may use
`@bigtest/convergence` to converge on these states and return
convergences inside of your hooks. The hooks provided by
`@bigtest/mocha` will automatically set the timeout and run returned
`Convergence` instances.

``` javascript
describe('clicking my button', () => {
  // @bigtest/mocha will wait for a returned Convergence to converge
  // before continuing with the assertions
  beforeEach(() => new Convergence()
    .once(() => expect($button).to.exist)
    .do(() => $button.click()));

  it('shows a loading indicator', () => {
    expect($button.className).to.include('is-loading');
  });
});
```

Check out the `@bigtest/convergence` [API
docs](https://github.com/thefrontside/bigtest/tree/master/packages/convergence#using-convergence)
for working with the `Convergence` class.

### Pausing Tests

Pausing tests can be very useful when debugging. It allows you to
investigate your application during a critical moment in your testing
suite. Mocha does not have a convinient way to pause tests, but
`@bigtest/mocha` helps alleviate this by providing an `it.pause`
method. It works by setting the current timeout to `0` and gives Mocha
a promise that never resolves. This effectively pauses the entire
suite until you remove `it.pause` and restart your tests.

``` javascript
describe('clicking my button', () => {
  beforeEach(() => $button.click());

  // if the class is never set, this test will fail; it.pause allows
  // us to investigate the app at this point in the test suite
  it.pause('shows a loading indicator', () => {
    expect($button.className).to.include('is-loading');
  });
});
```
