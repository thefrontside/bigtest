# @bigtest/convergence [![CircleCI](https://circleci.com/gh/bigtestjs/convergence/tree/master.svg?style=svg)](https://circleci.com/gh/bigtestjs/convergence/tree/master)

Recognize a desired state and synchronize on when that state has been achieved.

## Why Convergence?

Let's say you want to write an assertion to verify a simple cause and
effect: when a certain button is clicked, a dialog appears containing
some text that gets loaded from the network.

In order to do this, you have to make sure that your assertion runs
_after_ the effect you're testing has been realized.

![Image of assertion after an effect](https://raw.githubusercontent.com/thefrontside/bigtest/master/packages/convergence/images/assertion-after.png)

If not, then you could end up with a false negative, or "flaky test"
because you ran the assertion too early. If you'd only waited a little
bit longer, then your test would have passed. So sad!

![Image of false negative test](https://raw.githubusercontent.com/thefrontside/bigtest/master/packages/convergence/images/false-negative.png)

In fact, test flakiness is the reason most people shy away from
writing big tests in JavaScript in the first place. It seems almost
impossible to write robust tests without having visibility into the
internals of your runtime so that you can manually synchronize on
things like rendering and data loading. Unfortunately, those can be a
moving target, and worse, they couple you to your framework.

But what if instead of trying to run our assertions at just the right
time, we ran them _many_ times until they either pass or we decide to
give up?

![Image of convergent assertion](https://raw.githubusercontent.com/thefrontside/bigtest/master/packages/convergence/images/convergent-assertion.png)

This is the essence of what `@bigtest/convergence` provides:
repeatedly testing for a condition and then allowing code to run when
that condition has been met.

And it isn't just for assertions either. Because it is a general
mechanism for synchronizing on any observed state, It can be used to
properly time test setup and teardown as well.

## Creating a Convergence

A convergent function is a function that runs repeatedly until it no
longer returns false or throws an error. When the function is finally
successfully executed, it is considered to be passing and a converging
promise will resolve. However, if the converging function does not pass
within the provided timeout period the promise will reject with the
last error thrown from the function.

### Using `Convergence`

The `Convergence` class allows you to create a convergence, add
assertions to converge on, and execute the convergent assertions all
within a single timeout period.

``` javascript
import Convergence from '@bigtest/convergence'

// starts a new queue
new Convergence()
  // adds a convergent function to the queue
  .when(() => expect($el).to.exist)
  // called when the previous function converges
  .do(() => $el.get(0).click())
  // adds a convergent function that resolves when it is true
  // for the remaining timeout period
  .always(() => expect($el).to.have.prop('disabled', true))
  // starts converging and returns a promise that resolves
  // when all convergences have been met
  .run()
```

#### Immutability

`Convergence` has an immutable interface, so it's methods will
return new instances.

``` javascript
// will converge when the total equals 5
let convergeWhen = new Convergence()
  .when(() => total === 5);

// will log the total after the first convergence
let convergeAndLog = convergeWhen
  .do(() => console.log(total));

// after logging the total, will converge when it remains 5 for the
// duration of the remaining timeout
let convergeAlways = convergeAndLog
  .always(() => total === 5);

// all three convergences can be ran in parallel
convergeWhen.run();
convergeAndLog.run();
convergeAlways.run();
```

_Note: `.run()` does not return a new instance, instead it returns a promise._

---

#### Syntax

``` javascript
new Convergence([timeout = 2000]);
```

#### Parameters

**`timeout`**

You can define the convergences total timeout during initialization of
a `Convergence` instance. This timeout will be used for the set of
convergent functions unless the `.timeout()` method is used to change
the total timeout period.

``` javascript
let converge = new Convergence(1000);
```

#### Methods

**`.timeout([timeout])`**

Given a timeout (in `ms`), the `.timeout()` method will return a new
`Convergence` instance with the new timeout period replacing the old
one. When no argument is given, this method will return the current
timeout period of the convergence.

``` javascript
let convergeLong = converge.timeout(5000);

converge.timeout();  // => 1000
convergeLong.timeout(); // => 5000
```

**`.when(assert)`**

Returns a new `Convergence` instance and adds the provided assertion
to its queue. When this instance is ran, the `assert` function will be
looped over repeatedly until it passes, or until the convergence's
timeout has been exceeded.

``` javascript
// this convergence will resolve when `total` equals `5`
converge.when(() => total === 5)
```

**`.always(assert[, timeout])`**

Another common pattern is asserting that something **has not**
changed. With a typical convergence, the state may change after an
assertion converges immediately. So for these scenarios, you want to
converge _when the assertion passes for the duration of a timeout._
`.always()` is just like `.when()` above, except that the `assert`
function is looped over repeatedly until it fails for the first time
or never fails for the duration of the timeout.

``` javascript
// this convergence will resolve when total is always 5
// for the duration of the remaining timeout
converge.always(() => total === 5)
```

When a convergence added with `.always()` is last in the queue, it
will default to the remaining timeout to converge on its assertion
always passing. When it _is not_ last in the queue, `timeout` defaults
to one-tenth of the total timeout or `20ms` (whichever is greater).

``` javascript
converge
  // will be given any remaining timeout
  .always(() => total === 5)

converge
  // waits 500ms
  .always(() => total === 5, 500)

converge
  .timeout(2000)
  // defaults to 200ms (one-tenth 2000ms)
  .always(() => total === 5)
  .when(() => total === 10)
```

**`.do(exec)`**

This method is useful when you need to execute something after a
convergence in the queue, but before other convergences are ran.
This can help with debugging in between convergences and also
allows you to run side effects between convergences.

``` javascript
converge
  .when(() => total === 5)
  // executes after the total is equal to 5
  .do(() => total *= 100)
  // starts converging after the total has been multiplied
  .always(() => total === 500)
```

Functions in a `Convergence` queue curry their return value
between other functions in the queue. This means that what you return
from one function in the queue will be available as the argument
given to the next function in the queue.

``` javascript
converge
  // returns the element when it exists in the DOM
  .when(() => {
    let $el = $('[data-test-element]');
    expect($el).to.exist;
    return $el;
  })
  // clicks the element and returns it for chaining
  .do(($el) => {
    $el.get(0).click();
    return $el;
  })
  // converges when the element is disabled for the remaining timeout
  .always(($el) => {
    expect($el).to.have.prop('disabled', true)
  })
```

You can even return promises, or other convergences from this method.

``` javascript
converge
  .do(() => Promise.resolve(5))
  .do((total) => new Convergence()
    // the final always will still get the remaining time
    .always(() => total === 5 && total))
  // ... unless it is followed by additional methods
  .do((total) => total *= 100)
```


**`.append()`**

Combines convergences to allow composing them together to create brand
new convergence instances.

``` javascript
let converge1 = converge.when(() => total === 1)
let converge5 = converge.when(() => total === 5)

// converges when the total first equals `1` and then equals `5`
converge1.append(converge5)
```

**`.run()`**

In order to actually run a `Convergence` instance, you must call the
`.run()` method. This method **does not return another instance**,
instead it returns a promise that resolves when all assertions in the
queue have converged. The returned promise will keep track of the
current timeout and ensure that all convergences in the queue converge
within that period.

Because `.run()` returns a promise, and `Convergence` is immutable,
you can call `.run()` multiple times on the same convergence instance.

``` javascript
converge.run()
  .catch(() => {
    console.log('failed. trying again...');
    return converge.run();
  })
  .then(() => {
    console.log('success!')
  });
```

The promise returned from `.run()` resolves with a stats object. This
stats object holds various information about how the convergences in
the queue ran. The `queue` property is an array of stats objects
specific to each function in the queue.

``` javascript
converge.run((stats) => {
  stats.start    // start time of the convergences
  stats.end      // end time of the convergences
  stats.elapsed  // time taken to converge on the entire queue
  stats.runs     // number of times functions in the queue ran
  stats.timeout  // this Convergence instance's timeout
  stats.value    // value returned from the last function in the queue
  stats.queue    // an array of stats objects from the queue

  // each function in the queue produces similar stats objects
  stats.queue[0].start    // start time of this convergence
  stats.queue[0].end      // end time of this convergence
  stats.queue[0].elapsed  // time taken for this convergence
  stats.queue[0].runs     // number of times this convergence ran
  stats.queue[0].timeout  // the timeout this convergence was given
  stats.queue[0].always   // whether this convergence used .always()
  stats.queue[0].value    // value returned from this convergence
});
```

_Note: functions added using `.do()` produce a small stats object as
well, but they omit `runs`, `timeout`, and `always` since they do not
apply to these functions._

### Helpers

In addition to the `Convergence` class, this package also exports a
few convergence helpers.

**`isConvergence(object)`**

Returns `true` if the given `object` implements a `Convergence`
interface. A `Convergence` interface consists of a queue, a
`#timeout()` method, and a `#run()` method.

``` javascript
class CustomConvergence extends Convergence() {
  ...
}

isConvergence(new Convergence()) // => true
isConvergence(new CustomConvergence()) // => true
isConvergence(new Array()) // => false
```

**`when(assertion[, timeout=2000])`**

Starts converging on the given `assertion`, resolving when it passes
_within_ the timeout period. The assertion will run once every 10ms
and is considered to be passing when it does not error or return
false. If the assertion never passes within the timeout period, the
promise will reject as soon as it can with the last error it recieved.

``` javascript
// simple boolean test
await when(() => total === 100)

// with chai assertions
await when(() => {
  expect(total).to.equal(100)
  expect(add(total, 1)).to.equal(101)
})
```

Returns a thennable function that can both be used as a callback and
awaited on directly. For example, testing frameworks that support
async tests work well with convergent assertions.

``` javascript
test('will eventually become bar within 1s', when(() => {
  expect(foo).to.equal('bar');
}, 1000));
```

_Note: `when` will throw an error **after** it fails to converge
within the timeout. When using with testing frameworks, be aware of
any test timeouts that may occur before the convergence fails._

**`always(assertion[, timeout=200])`**

Starts converging on the given `assertion`, resolving when it passes
_throughout_ the timeout period. Like `when()`, The assertion will run
once every 10ms and is considered to be passing when it does not error
or return false. However, if the assertion does not pass consistently
throughout the entire timeout period, it will reject the very first
time it encounters a failure.

```javascript
// simple boolean test
await always(() => total !== 100)

// with chai assertions
await always(() => {
  expect(total).to.not.equal(100)
  expect(add(total, 1)).to.equal(101)
})
```

Also returns a thennable function that can both be used as a callback
and awaited on directly.

``` javascript
test('remains foo for at least 1s', always(() => {
  expect(foo).to.equal('foo');
}, 1000));
```

_Note: `always` will resolve **after** it converges throughout the
entire timeout. When using with testing frameworks, be aware of any
test timeouts that may occur before the convergence resolves._
